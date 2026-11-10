<?= $this->extend('admin/layout') ?>
<?= $this->section('content') ?>
<?php $v = static fn (string $k, $d = '') => old($k, $product[$k] ?? $d); ?>
<form class="card form" method="post" action="<?= $product ? site_url("admin/warna/{$product['id']}") : site_url('admin/warna') ?>">
    <?= csrf_field() ?>
    <div class="grid">
        <label>Nama warna<input name="name" value="<?= esc($v('name')) ?>" required maxlength="60" placeholder="Teal Laut"></label>
        <label>Kode warna<span class="color-row"><input type="color" value="<?= esc($v('hex', '#344d52')) ?>" oninput="this.nextElementSibling.value=this.value" aria-label="Pilih warna"><input name="hex" value="<?= esc($v('hex', '#344d52')) ?>" required pattern="#[0-9a-fA-F]{6}" maxlength="7" oninput="if(/^#[0-9a-fA-F]{6}$/.test(this.value))this.previousElementSibling.value=this.value"></span></label>
        <label>Urutan<input name="sort" type="number" value="<?= esc($v('sort', 0)) ?>"></label>
        <label>Harga (Rp)<input name="price" inputmode="numeric" value="<?= esc($v('price', 1299000)) ?>" required></label>
        <label>Stok<input name="stock" type="number" min="0" value="<?= esc($v('stock', 0)) ?>" required></label>
        <label class="check"><input type="checkbox" name="is_active" value="1" <?= $v('is_active', 1) ? 'checked' : '' ?>> Tampil di website</label>
    </div>
    <p class="hint">Kode warna dipakai untuk warna case 3D di website, jadi samakan dengan warna produk aslinya.</p>
    <div class="form-foot">
        <a class="btn" href="<?= site_url('admin/warna') ?>">Batal</a>
        <button class="btn primary" type="submit"><?= $product ? 'Simpan' : 'Tambah warna' ?></button>
    </div>
</form>
<?= $this->endSection() ?>
