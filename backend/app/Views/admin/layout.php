<?php
$admin = session('admin');
$badge = ['pesanan' => db_connect()->table('orders')->where('status', 'baru')->countAllResults()];
$path  = uri_string();
$nav   = [
    ['admin', 'Dashboard', 'M3 13h8V3H3zm10 8h8V11h-8zM3 21h8v-6H3zm10-18v6h8V3z', null],
    ['admin/pesanan', 'Pesanan', 'M6 7h12l-1 13H7L6 7zM9 7a3 3 0 0 1 6 0', 'pesanan'],
    ['admin/warna', 'Warna & stok', 'M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.5 0-1.2-1-1.5-1-2.5S13.3 15 14.5 15H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8zM7.5 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z', null],
];
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex">
    <title><?= esc($title ?? 'Admin') ?> · Admin <?= esc(config('Store')->name) ?></title>
    <link rel="stylesheet" href="<?= base_url('css/admin.css') ?>">
</head>
<body>
<div class="admin">
    <aside class="sidebar" id="sidebar">
        <a href="<?= site_url('admin') ?>" class="brand"><span class="mark">F</span><span>Fabu<b>lous</b></span> <small>admin</small></a>
        <nav>
            <?php foreach ($nav as [$url, $label, $icon, $key]): $on = $url === 'admin' ? $path === 'admin' : str_starts_with($path, $url); ?>
                <a href="<?= site_url($url) ?>" class="<?= $on ? 'active' : '' ?>"><svg viewBox="0 0 24 24"><path d="<?= $icon ?>"/></svg><?= $label ?><?php if ($key && $badge[$key]): ?><span class="pill"><?= $badge[$key] ?></span><?php endif ?></a>
            <?php endforeach ?>
        </nav>
        <div class="sidebar-foot">
            <a href="<?= base_url('/') ?>" target="_blank" rel="noopener">↗ Lihat website</a>
            <a href="<?= site_url('admin/logout') ?>">⎋ Logout</a>
        </div>
    </aside>
    <main class="main">
        <header class="topbar">
            <button type="button" class="menu-toggle" aria-label="Buka menu" onclick="document.getElementById('sidebar').classList.toggle('open')">☰</button>
            <h1><?= esc($title ?? 'Admin') ?></h1>
            <span class="who"><?= esc($admin['name'] ?? '') ?></span>
        </header>
        <?php if (session('success')): ?><div class="alert ok"><?= session('success') ?></div><?php endif ?>
        <?php if (session('error')): ?><div class="alert err"><?= esc(session('error')) ?></div><?php endif ?>
        <?php if (session('errors')): ?><div class="alert err"><ul><?php foreach ((array) session('errors') as $e): ?><li><?= esc($e) ?></li><?php endforeach ?></ul></div><?php endif ?>
        <?= $this->renderSection('content') ?>
    </main>
</div>
</body>
</html>
