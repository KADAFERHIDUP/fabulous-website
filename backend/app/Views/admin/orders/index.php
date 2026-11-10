<?= $this->extend('admin/layout') ?>
<?= $this->section('content') ?>
<div class="toolbar">
    <nav class="tabs">
        <a class="<?= $status === '' ? 'active' : '' ?>" href="<?= site_url('admin/pesanan') ?>">Semua</a>
        <?php foreach (config('Store')->orderStatuses as $k => $l): ?><a class="<?= $status === $k ? 'active' : '' ?>" href="<?= site_url('admin/pesanan?status=' . $k) ?>"><?= $l ?></a><?php endforeach ?>
    </nav>
    <form class="filters" method="get" action="<?= site_url('admin/pesanan') ?>">
        <?php if ($status): ?><input type="hidden" name="status" value="<?= esc($status) ?>"><?php endif ?>
        <input type="search" name="q" value="<?= esc($q) ?>" placeholder="Cari kode, nama, nomor" aria-label="Cari pesanan">
        <a class="btn" href="<?= site_url('admin/pesanan/csv') ?>">Unduh CSV</a>
    </form>
</div>
<section class="card">
<?php if (! $orders): ?>
    <p class="empty"><?= $q !== '' || $status !== '' ? 'Tidak ada pesanan yang cocok.' : 'Belum ada pesanan.' ?></p>
<?php else: ?>
    <div class="table-wrap"><table>
        <thead><tr><th>Kode</th><th>Produk</th><th>Pembeli</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody><?php foreach ($orders as $order): ?><?= view('admin/_order_row', ['order' => $order, 'withDelete' => true]) ?><?php endforeach ?></tbody>
    </table></div>
    <p class="hint">Mengubah status ke <b>Batal</b> mengembalikan stok. Menghapus pesanan yang belum dikirim juga mengembalikan stok.</p>
<?php endif ?>
</section>
<?= $this->endSection() ?>
