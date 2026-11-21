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
2. Buka `.env`, lalu **isi `ADMIN_PASSWORD`** sendiri, minimal 10 karakter berisi huruf dan angka (simpan di password manager, jangan di-commit).
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

## Pengamanan

- Harga, total, dan stok selalu dihitung di server dari database. Angka kiriman browser tidak dipercaya.
- Login admin dibatasi 5 percobaan per 5 menit per IP, dengan waktu respons yang sama untuk email terdaftar maupun tidak.
- Semua kiriman API publik dibatasi per menit **dan** per hari per IP, supaya satu orang tidak bisa menghabiskan stok atau membanjiri admin dengan data palsu.
- Tidak ada password admin bawaan. `ADMIN_PASSWORD` wajib minimal 10 karakter berisi huruf dan angka; kalau dikosongkan, password acak dibuat saat seeding. Password contoh lama (misalnya `admin12345`) ditolak saat login.
- Ganti password admin kapan saja: `php spark admin:password`.
- File CSV untuk admin aman dibuka di Excel: isi yang diawali `=`, `+`, `-`, atau `@` tidak dijalankan sebagai rumus.
- Foto upload dicek isinya, diberi nama acak, dan folder upload menolak menjalankan skrip.

## Hosting

Upload folder `backend/` ke hosting PHP, arahkan domain ke folder `public/`, buat database MySQL, isi `.env` (`app.baseURL`, data database, `CI_ENVIRONMENT = production`), lalu jalankan `php spark migrate` dan `php spark db:seed DatabaseSeeder` lewat terminal hosting.
