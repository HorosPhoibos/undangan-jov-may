# Panduan Undangan Jov & May

## 1. Ganti data undangan
Buka `config.js` dan ganti semua baris yang bertanda `← GANTI`: nama lengkap dan marga, orang tua, jam, nama dan alamat gereja/gedung, link Google Maps, serta rekening.

Teks kisah tiap bab dan ayat-ayatnya ada di `index.html` (cari "Dua Kota", "Bertemu", dan seterusnya).

## 2. QRIS
1. Buka aplikasi bank/e-wallet, pilih "QRIS saya" / "Terima uang", lalu simpan gambarnya.
2. Simpan sebagai `assets/qris.png`.
3. Di `config.js`, ubah `qris: "assets/qris-placeholder.svg"` menjadi `qris: "assets/qris.png"`.

## 3. Musik
Taruh lagu sebagai `assets/music.mp3`, misalnya lagu Simalungun favorit keluarga. Tombol musik muncul otomatis. Pakai lagu yang boleh kamu pakai.

## 4. Ucapan tersimpan untuk semua tamu (Google Sheets)
Tanpa langkah ini, ucapan hanya tersimpan di HP tamu yang mengirimnya.
1. Buat Google Sheet baru, lalu buka menu **Extensions → Apps Script**.
2. Hapus isinya, tempel seluruh isi file `apps-script.gs`, lalu simpan.
3. Klik **Deploy → New deployment**, pilih jenis **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Klik Deploy, izinkan aksesnya, lalu salin URL yang berakhiran `/exec`.
5. Tempel URL itu di `config.js` pada `sheetUrl: ""`.

## 5. Online-kan (gratis)
Paling mudah: **Netlify Drop**.
1. Buka https://app.netlify.com/drop.
2. Seret folder `undangan-jov-may` ke sana.
3. Ganti nama situsnya di pengaturan, misalnya `jov-may.netlify.app`.

## 6. Link per tamu
Tambahkan `?to=Nama+Tamu` di belakang link:

    https://jov-may.netlify.app/?to=Bapak+Saragih+sekeluarga

Nama itu muncul di cover sebagai "Kepada Yth.".
