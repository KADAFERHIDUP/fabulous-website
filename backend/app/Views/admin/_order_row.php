<?php $labels = config('Store')->orderStatuses; $o = $order; ?>
<tr>
    <td><b><?= esc($o['code']) ?></b><br><span class="muted"><?= esc(waktu($o['created_at'])) ?></span></td>
    <td><span class="dot" style="background:<?= esc($o['hex']) ?>"></span><?= esc($o['product_name']) ?> × <?= (int) $o['qty'] ?><br><span class="muted"><?= rupiah($o['total']) ?></span></td>
    <td><?= esc($o['name']) ?><br><span class="muted"><?= esc($o['phone']) ?> · <?= esc(config('Store')->deliveries[$o['delivery']] ?? $o['delivery']) ?></span>
        <?php if ($o['address']): ?><br><span class="muted"><?= esc($o['address']) ?></span><?php endif ?>
        <?php if ($o['note']): ?><br><em class="note">“<?= esc($o['note']) ?>”</em><?php endif ?></td>
    <td>
        <form method="post" action="<?= site_url("admin/pesanan/{$o['id']}/status") ?>"><?= csrf_field() ?>
            <select name="status" class="s-<?= esc($o['status']) ?>" onchange="this.form.submit()" aria-label="Status <?= esc($o['code']) ?>">
                <?php foreach ($labels as $k => $l): ?><option value="<?= $k ?>" <?= $o['status'] === $k ? 'selected' : '' ?>><?= $l ?></option><?php endforeach ?>
            </select>
        </form>
    </td>
    <td><div class="actions">
        <a class="btn sm wa" target="_blank" rel="noopener" href="<?= esc(wa_url($o['phone'], "Halo {$o['name']}, kami dari " . config('Store')->name . ". Pesanan {$o['code']} (Fabulous Pods {$o['product_name']} × {$o['qty']}, " . rupiah($o['total']) . ') sudah kami terima.')) ?>">WhatsApp</a>
        <?php if (! empty($withDelete)): ?>
        <form method="post" action="<?= site_url("admin/pesanan/{$o['id']}/hapus") ?>" onsubmit="return confirm('Hapus pesanan <?= esc($o['code'], 'js') ?>?')"><?= csrf_field() ?><button class="btn sm danger" type="submit">Hapus</button></form>
        <?php endif ?>
    </div></td>
</tr>
