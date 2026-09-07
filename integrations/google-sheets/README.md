# Aktivasi sinkronisasi Google Sheets

Spreadsheet: https://docs.google.com/spreadsheets/d/1-AhoLs-5SeP5xwnMrjAKar4-Sy3rgNVD2xcGH4lsyKo/edit

Tab Report Website dan Kategori Website sudah disiapkan. Tab Juli dan September tidak diubah.

## 1. Aktifkan penghubung Google

1. Buka spreadsheet → Extensions / Ekstensi → Apps Script.
2. Tambahkan file script bernama DailyReportSync. Salin seluruh isi Code.gs di folder ini. Jika sudah ada script lain, pertahankan dan periksa agar tidak ada fungsi doPost yang bentrok.
3. Simpan. Pilih fungsi setup dan klik Run. Berikan izin menggunakan akun yang mempunyai akses edit spreadsheet.
4. Buka Project Settings → Script properties. Salin nilai REPORT_SECRET untuk langkah Vercel. Jangan taruh nilai ini di GitHub atau kode browser.
5. Deploy → New deployment → Web app. Execute as: Me; Who has access: Anyone. Penghubung menolak permintaan tanpa secret. Spreadsheet tidak perlu dibuat publik.
6. Salin Web app URL yang berakhir /exec.

Panduan Google: https://developers.google.com/apps-script/guides/web

## 2. Hubungkan Vercel

Di project Daily-Report-Leader → Settings → Environment Variables, tambahkan untuk Production dan Preview:

| Nama | Nilai |
| --- | --- |
| GOOGLE_SHEETS_WEB_APP_URL | URL /exec dari Apps Script |
| GOOGLE_SHEETS_SECRET | REPORT_SECRET dari Script properties |

Website tidak memakai sandi login. Jangan memakai prefix NEXT_PUBLIC_ untuk kedua variabel ini. Atur Vercel Firewall rate limiting untuk /api/reports sesuai kebutuhan tim.

Sesudah variabel lengkap, deploy branch integrasi. vercel.json sudah mengatur build Next.js dan postcss.config.mjs menjaga styling Tailwind.

Untuk lokal, salin .env.example ke .env.local dan isi nilainya. Jalankan npx next dev --port 5187 atau restart server lokal setelah konfigurasi.

## 3. Verifikasi sebelum dipakai tim

Pilih divisi dan simpan satu report, lalu buka website dari browser/perangkat kedua. Pastikan report dan kategori muncul. Dashboard memuat ulang setiap 30 detik saat terbuka, saat tab kembali aktif, atau lewat tombol Muat ulang.

Tombol Pindahkan report lama mengirim data yang masih tersimpan di browser. Report dengan tanggal dan divisi yang sudah ada dilewati; salinan lokal tidak dihapus. Jalankan dari browser dan alamat website asal data lama (localhost dan domain Vercel memiliki penyimpanan berbeda).

## Perilaku data

- Satu report aktif per tanggal dan divisi. Menyimpan pengganti memerlukan konfirmasi; pengubahan bersamaan diperiksa lagi di server.
- Versi report dicatat sebagai baris tambahan supaya riwayat tetap ada. Dashboard memakai versi terakhir, bukan menghitung semua revisi.
- Kolom A–M menampilkan ringkasan yang mudah dibaca. Kolom N menyimpan struktur lengkap untuk dashboard. Mengedit ringkasan A–M tidak mengubah dashboard; lakukan pembaruan report melalui website. Jangan mengedit kolom N manual.
- Kategori tambahan tersimpan di Kategori Website dan juga dapat dibaca dari aktivitas report.
- Siapa pun yang memiliki link website bisa melihat dan mengirim report kedua divisi. Tidak ada login atau hak akses per orang.
- Koneksi gagal tidak dianggap berhasil menyimpan; isian tetap berada di halaman. Jangan menutup atau memuat ulang halaman sebelum penyimpanan berhasil.
- Sinkronisasi baru aktif setelah Apps Script dan variabel server selesai. Integrasi belum diuji ke Google secara langsung sebelum aktivasi tersebut.
