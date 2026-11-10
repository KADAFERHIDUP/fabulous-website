<?= $this->extend('admin/layout') ?>
<?= $this->section('content') ?>
<div class="stats">
    <a class="stat" href="<?= site_url('admin/pesanan?status=baru') ?>"><span>Pesanan baru</span><b><?= $stats['new'] ?></b></a>
    <a class="stat" href="<?= site_url('admin/pesanan?status=diproses') ?>"><span>Diproses / dikirim</span><b><?= $stats['active'] ?></b></a>
    <div class="stat"><span>Unit terjual</span><b><?= $stats['sold'] ?></b></div>
    <div class="stat"><span>Pendapatan (selesai)</span><b><?= rupiah($stats['revenue']) ?></b></div>
    <a class="stat" href="<?= site_url('admin/warna') ?>"><span>Warna stok menipis</span><b><?= $stats['low'] ?></b></a>
</div>
<section class="card">
    <div class="card-head"><h2>Pesanan terbaru</h2><a href="<?= site_url('admin/pesanan') ?>">Semua →</a></div>
    <?php if (! $recent): ?>
        <p class="empty">Belum ada pesanan. Pesanan dari website akan muncul di sini.</p>
    <?php else: ?>
        <div class="table-wrap"><table>
            <thead><tr><th>Kode</th><th>Produk</th><th>Pembeli</th><th>Status</th><th></th></tr></thead>
            <tbody><?php foreach ($recent as $order): ?><?= view('admin/_order_row', ['order' => $order]) ?><?php endforeach ?></tbody>
        </table></div>
    <?php endif ?>
</section>
<section class="card">
    <div class="card-head"><h2>Stok per warna</h2><a href="<?= site_url('admin/warna') ?>">Atur →</a></div>
    <div class="stock-grid">
        <?php foreach ($stock as $p): ?>
            <div class="stock<?= $p['stock'] <= 3 ? ' low' : '' ?><?= $p['is_active'] ? '' : ' off' ?>"><span class="dot" style="background:<?= esc($p['hex']) ?>"></span><span><?= esc($p['name']) ?></span><b><?= (int) $p['stock'] ?></b></div>
        <?php endforeach ?>
    </div>
</section>
<?= $this->endSection() ?>
