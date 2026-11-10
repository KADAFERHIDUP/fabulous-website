# Fabulous Pods

Website produk earbuds **Fabulous** dengan objek 3D yang mengikuti scroll, dibuat oleh **Ahmad Umraithi**.

| Folder | Isi |
|---|---|
| `frontend/` | Website: HTML, CSS, JavaScript, three.js. Online di **https://fabulous.kadaferhidup.my.id** (GitHub Pages); tanpa backend, pesanan lewat WhatsApp. |
| `backend/` | CodeIgniter 4 + MySQL: API produk dan pesanan, panel admin. Kalau aktif, website otomatis memakai database. |

## Dua mode

- **Tanpa backend** (GitHub Pages, Live Server): harga dari data bawaan, tombol *Pesan* membuka WhatsApp.
- **Dengan backend** (`php spark serve`, XAMPP, Laragon, atau hosting PHP): harga, stok, dan daftar warna diambil dari database. Tombol *Pesan* membuka form pesanan; pesanan tersimpan dengan kode (misalnya `FB-261110-K7Q2`), stok berkurang otomatis, lalu pembeli bisa konfirmasi lewat WhatsApp. Warna yang stoknya habis tidak bisa dipesan.

Website mendeteksi sendiri apakah backend aktif (`api/health`). Untuk memakai backend di alamat lain, tambahkan `<script>window.FABULOUS_API = 'https://domain-kamu/api'</script>` sebelum `js/app.js` dan isi `CORS_ORIGINS` di `.env` backend.

## Frontend (`frontend/`)

Landing page produk earbuds nirkabel **Fabulous**, dibuat oleh **Ahmad Umraithi**. Gayanya mengikuti referensi Dribbble: latar biru-hitam, satu objek 3D yang berpindah tempat mengikuti scroll, dan bagian fitur dengan garis progres serta tiga kartu.

### Alur halaman

1. **Hero**: judul besar, case 3D berputar pelan di tengah.
2. **Fitur** (bagian lengket selama scroll): objek di kiri, garis progres di tengah, tiga kartu di kanan. Setiap kartu yang aktif mengubah objek 3D:
   - *Desain ramping dan elegan*: case tertutup, sedikit miring.
   - *Inti akustik super kuat*: tutup terbuka, earbuds terangkat, case menjadi tembus pandang (mode x-ray) dan driver terlihat.
   - *Baterai seharian*: lampu hijau berdenyut dan cahaya hijau di bawah case.
3. **Warna**: objek pindah ke kanan; 8 pilihan warna mengganti warna case 3D secara halus.
4. **Spesifikasi**: foto HD dari Unsplash dan 4 kartu spesifikasi.
5. **Beli**: 8 warna dengan gambar HD tanpa background yang dirender langsung dari model 3D, tombol pesan lewat WhatsApp.

### Teknologi

- HTML, CSS, JavaScript tanpa framework.
- **three.js r187** (disimpan di `vendor/`, tidak perlu internet). Case dan earbuds dibuat dari kode di `js/pods3d.js`, tanpa file model.
- Kalau browser tidak mendukung WebGL2, objek 3D diganti foto produk asli.
- Responsif sampai HP, bisa dipakai dengan keyboard (pilihan warna bisa dengan tombol panah), dan menghormati pengaturan *reduced motion*.

### Gambar

- **Katalog**: gambar case di 8 warna dirender dari model 3D saat halaman dibuka (resolusi tinggi, latar transparan), jadi selalu tajam dan sama persis dengan warna objek 3D.
- **Spesifikasi**: foto oleh [Daniel Lincoln](https://unsplash.com/@danny_lincoln) di [Unsplash](https://unsplash.com) (Unsplash License), dimuat langsung dari server Unsplash.
- `img/case-1.png` sampai `case-8.png`: foto case asli dari `Fabulous-master` (`p1.jpg`–`p8.jpg`) yang background-nya sudah dihapus. Hanya dipakai kalau browser tidak mendukung 3D.
- `img/logo.png`: logo dengan tulisan putih untuk latar gelap.

### Menjalankan

Buka lewat server lokal (karena memakai ES modules):

- VS Code: klik kanan `index.html` → *Open with Live Server*, atau
- terminal: `python -m http.server 8000`, lalu buka http://localhost:8000

### Mengubah isi

- Tanpa backend: harga dan nomor WhatsApp di `SHOP_PRICE` dan `SHOP` di `js/app.js`. Dengan backend: harga, stok, dan warna diatur dari panel admin.
- Nama dan warna case: `COLORS` di `js/app.js` (warna 3D memakai kode hex di sana).
- Harga, spesifikasi, dan klaim baterai adalah **contoh** untuk website demo.


## Backend (`backend/`)

CodeIgniter 4.7 + MySQL. Cara memasang ada di [`backend/README.md`](backend/README.md).

**API**
- `GET /api/health`: cek backend aktif
- `GET /api/products`: warna yang dijual, dengan harga dan stok
- `POST /api/orders`: simpan pesanan (validasi, batas 5 unit, cek stok, kode pesanan, link konfirmasi WhatsApp)

**Panel admin** (`/admin`)
- Dashboard: pesanan baru, yang sedang diproses, unit terjual, pendapatan, stok per warna.
- Pesanan: filter status, cari kode/nama/nomor, ubah status (Baru → Diproses → Dikirim → Selesai / Batal), tombol WhatsApp ke pembeli, hapus, unduh CSV untuk Excel.
- Warna & stok: tambah, edit (nama, kode warna, harga, stok, urutan), sembunyikan, hapus. Warna baru langsung muncul di website dan di objek 3D.

**Keamanan:** login admin dengan password ter-hash dan batas percobaan, CSRF di semua form admin, batas kiriman pesanan per IP, jebakan robot spam, stok dikurangi dalam transaksi sehingga dua pembeli tidak bisa sama-sama mengambil stok terakhir. Membatalkan pesanan mengembalikan stok.

## Kontak

- Email: umraithi769@gmail.com
- WhatsApp: 0822-7607-8880
