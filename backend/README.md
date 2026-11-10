# Backend Fabulous (CodeIgniter 4 + MySQL)

## Yang dibutuhkan

- PHP 8.1 atau lebih baru (ekstensi `intl`, `mbstring`, `mysqli`)
- MySQL atau MariaDB (XAMPP / Laragon sudah termasuk)
- [Composer](https://getcomposer.org/download/)

## Memasang

1. Jalankan installer dari folder `backend/`:
   - Windows: klik dua kali `install.bat`
   - Linux / macOS / Git Bash: `./install.sh`

   Installer mengunduh CodeIgniter 4, menyalin `../frontend` ke `public/`, dan membuat file `.env`.
2. Buka `.env`, lalu **ganti `ADMIN_PASSWORD`** (simpan di password manager, jangan di-commit).
3. Nyalakan MySQL, lalu:
   ```
   php spark db:create fabulous_db
   php spark migrate
   php spark db:seed DatabaseSeeder
   php spark serve
   ```
4. Buka http://localhost:8080 untuk website dan http://localhost:8080/admin untuk panel admin (email `ADMIN_EMAIL`, password `ADMIN_PASSWORD`).

Kalau frontend diubah, jalankan installer lagi supaya `public/` ikut terbarui.

## Isi database

- `users`: akun admin
- `products`: warna case (nama, kode warna, harga, stok, tampil/tidak, urutan). Seeder mengisi 8 warna dengan harga Rp 1.299.000 dan stok 10 sebagai contoh.
- `orders`: pesanan (kode, warna, jumlah, total, nama, WhatsApp, diantar/ambil, alamat, catatan, status)

## Hosting

Upload folder `backend/` ke hosting PHP, arahkan domain ke folder `public/`, buat database MySQL, isi `.env` (`app.baseURL`, data database, `CI_ENVIRONMENT = production`), lalu jalankan `php spark migrate` dan `php spark db:seed DatabaseSeeder` lewat terminal hosting.
