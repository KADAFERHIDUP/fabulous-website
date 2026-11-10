# Fabulous Pods: website produk earbuds 3D

Landing page produk earbuds nirkabel **Fabulous**, dibuat oleh **Ahmad Umraithi**. Gayanya mengikuti referensi Dribbble: latar biru-hitam, satu objek 3D yang berpindah tempat mengikuti scroll, dan bagian fitur dengan garis progres serta tiga kartu.

## Alur halaman

1. **Hero**: judul besar, case 3D berputar pelan di tengah.
2. **Fitur** (bagian lengket selama scroll): objek di kiri, garis progres di tengah, tiga kartu di kanan. Setiap kartu yang aktif mengubah objek 3D:
   - *Desain ramping dan elegan*: case tertutup, sedikit miring.
   - *Inti akustik super kuat*: tutup terbuka, earbuds terangkat, case menjadi tembus pandang (mode x-ray) dan driver terlihat.
   - *Baterai seharian*: lampu hijau berdenyut dan cahaya hijau di bawah case.
3. **Warna**: objek pindah ke kanan; 8 pilihan warna mengganti warna case 3D secara halus.
4. **Spesifikasi**: foto model (background sudah dihapus) dan 4 kartu spesifikasi.
5. **Beli**: 8 warna dengan foto produk asli tanpa background, tombol pesan lewat WhatsApp.

## Teknologi

- HTML, CSS, JavaScript tanpa framework.
- **three.js r187** (disimpan di `vendor/`, tidak perlu internet). Case dan earbuds dibuat dari kode di `js/pods3d.js`, tanpa file model.
- Kalau browser tidak mendukung WebGL2, objek 3D diganti foto produk asli.
- Responsif sampai HP, bisa dipakai dengan keyboard (pilihan warna bisa dengan tombol panah), dan menghormati pengaturan *reduced motion*.

## Foto

Semua gambar berasal dari file project asli (`Fabulous-master`):

- `img/case-1.png` sampai `case-8.png`: foto case 8 warna (`p1.jpg`–`p8.jpg`) yang background abu-abunya sudah dihapus.
- `img/model.png`: foto model (`a.png`) tanpa background.
- `img/logo.png`: logo dengan tulisan putih untuk latar gelap.

## Menjalankan

Buka lewat server lokal (karena memakai ES modules):

- VS Code: klik kanan `index.html` → *Open with Live Server*, atau
- terminal: `python -m http.server 8000`, lalu buka http://localhost:8000

## Mengubah isi

- Harga dan nomor WhatsApp: `SHOP` di `js/app.js`.
- Nama dan warna case: `COLORS` di `js/app.js` (warna 3D memakai kode hex di sana).
- Harga, spesifikasi, dan klaim baterai adalah **contoh** untuk website demo.

## Kontak

- Email: umraithi769@gmail.com
- WhatsApp: 0822-7607-8880
