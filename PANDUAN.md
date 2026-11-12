# Panduan Undangan Joshua & May

## 1. Ganti data undangan
Buka `config.js` dan ganti semua baris yang bertanda `← GANTI`: nama lengkap dan marga, orang tua, jam, nama dan alamat gereja/gedung, link Google Maps, serta rekening.

Teks kisah tiap bab dan ayat-ayatnya ada di `index.html` (cari "Dua Kota", "Bertemu", dan seterusnya).

## 2. QRIS
1. Buka aplikasi bank/e-wallet, pilih "QRIS saya" / "Terima uang", lalu simpan gambarnya.
2. Simpan sebagai `assets/qris.png`.
3. Di `config.js`, ubah `qris: "assets/qris-placeholder.svg"` menjadi `qris: "assets/qris.png"`.

## 3. Musik
Taruh lagu sebagai `assets/background.mp3` (di dalam folder `assets`, bukan `assets/img`). Musik mulai saat tamu menekan "Buka Undangan", dan tombol musik untuk mematikan/menyalakan muncul otomatis di pojok kanan bawah. Pakai lagu yang boleh kamu pakai, dan sebaiknya ukurannya di bawah 5 MB supaya cepat dimuat.

## 4. Ucapan tersimpan untuk semua tamu (Google Sheets, gratis)
Tanpa langkah ini, ucapan hanya tersimpan di HP tamu yang mengirimnya.
Ucapan dari form RSVP dan dari form tanda kasih masuk ke sheet yang sama. Kolom **metode** dan **nominal** hanya terlihat oleh kalian di sheet, tidak pernah tampil di website.
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

## 6. Kirim ke tamu dari daftar Excel
Buka `kirim.html` di website kamu, misalnya `https://jov-may.netlify.app/kirim.html`. Halaman ini untukmu saja dan tidak ditautkan dari undangan.

1. Isi alamat website undangan.
2. Ubah teks undangan kalau mau. `{nama}` dan `{link}` terisi otomatis.
3. Upload Excel dengan kolom **Nama** dan **No WhatsApp**. Tombol "Unduh contoh Excel" memberi format yang benar.
4. Tekan **Kirim WA** di tiap tamu. WhatsApp terbuka dengan pesan siap kirim; tinggal tekan kirim. Tamu yang sudah dikirimi otomatis dicentang.
5. **Unduh Excel + link** menyimpan daftar lengkap dengan link pribadi setiap tamu.

Daftar tamu hanya tersimpan di browser yang kamu pakai, tidak dikirim ke mana-mana.

Link pribadi bentuknya seperti ini, dan nama tamu muncul di cover sebagai "Kepada Yth.":

    https://jov-may.netlify.app/?to=Bapak+Saragih+sekeluarga
