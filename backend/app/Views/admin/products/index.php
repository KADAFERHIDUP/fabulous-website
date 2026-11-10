<?= $this->extend('admin/layout') ?>
<?= $this->section('content') ?>
<div class="toolbar">
    <p class="hint">Harga dan stok di sini langsung dipakai website. Warna yang disembunyikan tidak bisa dipesan.</p>
    <a class="btn primary" href="<?= site_url('admin/warna/tambah') ?>">+ Tambah warna</a>
</div>
<section class="card">
    <div class="table-wrap"><table>
        <thead><tr><th>Warna</th><th>Harga</th><th>Stok</th><th>Di website</th><th>Aksi</th></tr></thead>
        <tbody>
        <?php foreach ($products as $p): ?>
            <tr>
                <td><span class="dot big" style="background:<?= esc($p['hex']) ?>"></span><b><?= esc($p['name']) ?></b><br><span class="muted"><?= esc($p['hex']) ?></span></td>
                <td><?= rupiah($p['price']) ?></td>
                <td><span class="tag <?= $p['stock'] <= 0 ? 's-batal' : ($p['stock'] <= 3 ? 's-diproses' : 's-selesai') ?>"><?= (int) $p['stock'] ?> unit</span></td>
                <td><?= $p['is_active'] ? 'Tampil' : '<span class="muted">Disembunyikan</span>' ?></td>
                <td><div class="actions">
                    <a class="btn sm" href="<?= site_url("admin/warna/{$p['id']}/edit") ?>">Edit</a>
                    <form method="post" action="<?= site_url("admin/warna/{$p['id']}/tampil") ?>"><?= csrf_field() ?><button class="btn sm" type="submit"><?= $p['is_active'] ? 'Sembunyikan' : 'Tampilkan' ?></button></form>
                    <form method="post" action="<?= site_url("admin/warna/{$p['id']}/hapus") ?>" onsubmit="return confirm('Hapus warna <?= esc($p['name'], 'js') ?>?')"><?= csrf_field() ?><button class="btn sm danger" type="submit">Hapus</button></form>
                </div></td>
            </tr>
        <?php endforeach ?>
        </tbody>
    </table></div>
</section>
<?= $this->endSection() ?>
