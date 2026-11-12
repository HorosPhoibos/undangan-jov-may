// =============================================================
//  SEMUA DATA UNDANGAN ADA DI SINI.
//  Ganti bagian yang bertanda  ← GANTI  lalu simpan file ini.
// =============================================================

window.WEDDING = {
  // ---------- Mempelai ----------
  groom: {
    nick: "Joshua",
    name: "Joshua Joviando Sinaga, S.E., S.H., M.M.",
    // \n = pindah baris
    parents: "Putra dari\nSt. Ir. Jhon Hardman Sinaga\n& St. Irawaty Devy Rosa Saragih",
    instagram: "",                                  // contoh: "joviando"
  },
  bride: {
    nick: "May",
    name: "May Noviarta Purba, S.E.",
    parents: "Putri dari\nBapak Arie Marison Purba (†)\n& Ibu Elisa Sinaga",
    instagram: "",
  },

  // Tanggal hari H untuk hitung mundur
  date: "2027-11-13T10:00:00+07:00",
  dateLabel: "Sabtu, 13 November 2027",
  firstMet: "10 · 10 · 2020",

  // ---------- Acara ----------
  events: [
    {
      title: "Pemberkatan Nikah",
      date: "Sabtu, 13 November 2027",
      time: "10.00 WIB – selesai",                  // ← GANTI
      start: "2027-11-13T10:00:00+07:00",
      end: "2027-11-13T12:00:00+07:00",
      place: "[Nama Gereja]",                       // ← GANTI
      address: "[Alamat lengkap gereja]",           // ← GANTI
      maps: "https://maps.google.com/?q=Gereja",    // ← GANTI (link Google Maps)
    },
    {
      title: "Pesta Adat Simalungun",
      date: "Sabtu, 13 November 2027",
      time: "13.00 WIB – selesai",                  // ← GANTI
      start: "2027-11-13T13:00:00+07:00",
      end: "2027-11-13T18:00:00+07:00",
      place: "[Nama Gedung / Tempat]",              // ← GANTI
      address: "[Alamat lengkap tempat pesta]",     // ← GANTI
      maps: "https://maps.google.com/?q=Pematangsiantar", // ← GANTI
    },
  ],

  // ---------- Amplop digital ----------
  banks: [
    { bank: "BCA", number: "0000000000", holder: "Joshua Joviando Sinaga" },  // ← GANTI nomor
    { bank: "BRI", number: "0000000000000", holder: "May Noviarta Purba" },   // ← GANTI nomor
  ],
  ewallets: [
    { name: "GoPay", number: "08xx-xxxx-xxxx", holder: "Joshua Joviando Sinaga" }, // ← GANTI / hapus
  ],
  // Simpan gambar QRIS dari aplikasi bank/e-wallet ke assets/qris.png lalu ganti baris ini
  qris: "assets/qris-placeholder.svg",              // ← GANTI jadi "assets/qris.png"
  giftAddress: "[Alamat kirim kado fisik]",         // ← GANTI / kosongkan "" kalau tidak perlu

  // ---------- RSVP & ucapan ----------
  // Tempel URL Web App Google Apps Script di sini (lihat PANDUAN.md).
  // Kalau masih kosong, ucapan hanya tersimpan di HP masing-masing tamu.
  sheetUrl: "",

  // ---------- Musik ----------
  // Taruh lagu di assets/background.mp3. Musik mulai saat tamu menekan "Buka Undangan".
  // Kalau file tidak ada, tombol musik otomatis disembunyikan.
  music: "assets/background.mp3",
};
