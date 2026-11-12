// Google Apps Script untuk menyimpan RSVP & ucapan ke Google Sheets.
// Cara pasang ada di PANDUAN.md.

const SHEET = "Ucapan";

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(["waktu", "nama", "hadir", "jumlah", "ucapan"]);
  }
  return sh;
}

function clean_(v, max) {
  return String(v || "").replace(/[<>]/g, "").trim().slice(0, max);
}

function doPost(e) {
  const p = e.parameter || {};
  const nama = clean_(p.nama, 60);
  const ucapan = clean_(p.ucapan, 500);
  if (!nama || !ucapan || p.website) return out_({ ok: false });

  // batas sederhana: nama yang sama maksimal 1 kali per menit
  const cache = CacheService.getScriptCache();
  if (cache.get(nama)) return out_({ ok: false, reason: "too-fast" });
  cache.put(nama, "1", 60);

  sheet_().appendRow([new Date(), nama, clean_(p.hadir, 20), clean_(p.jumlah, 2), ucapan]);
  return out_({ ok: true });
}

function doGet() {
  const rows = sheet_().getDataRange().getValues().slice(1);
  const list = rows.slice(-200).map((r) => ({ waktu: r[0], nama: r[1], hadir: r[2], jumlah: r[3], ucapan: r[4] }));
  return out_(list);
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
