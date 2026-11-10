<?php

namespace App\Controllers\Api;

use App\Models\OrderModel;
use App\Models\ProductModel;

/**
 * Pesanan dari website. Stok dikurangi dalam transaksi yang sama dengan penyimpanan pesanan,
 * jadi dua orang yang memesan stok terakhir bersamaan tidak bisa sama-sama berhasil.
 */
class Orders extends BaseApi
{
    public function create()
    {
        if (! $this->allowed('orders', 5)) {
            return $this->tooMany();
        }
        $data = $this->payload();
        if ($this->isBot($data)) {
            return $this->respondCreated(['code' => 'FB-000000-0000']); // robot: pura-pura berhasil, tidak disimpan
        }
        $cfg   = config('Store');
        $data += ['product_id' => '', 'qty' => 1, 'name' => '', 'phone' => '', 'delivery' => 'antar', 'address' => '', 'note' => ''];
        $rules = [
            'product_id' => 'required|is_natural_no_zero',
            'qty'        => "required|is_natural_no_zero|less_than_equal_to[{$cfg->maxQty}]",
            'name'       => 'required|min_length[2]|max_length[80]',
            'phone'      => 'required|max_length[20]',
            'delivery'   => 'required|in_list[' . implode(',', array_keys($cfg->deliveries)) . ']',
            'address'    => 'permit_empty|max_length[400]',
            'note'       => 'permit_empty|max_length[300]',
        ];
        $messages = [
            'qty'   => ['less_than_equal_to' => "Maksimal {$cfg->maxQty} per pesanan.", 'is_natural_no_zero' => 'Jumlah minimal 1.'],
            'name'  => ['required' => 'Tulis namamu.', 'min_length' => 'Nama terlalu pendek.'],
            'phone' => ['required' => 'Tulis nomor WhatsApp.'],
        ];
        if (! $this->validateData($data, $rules, $messages)) {
            return $this->invalid();
        }
        $phone = normalize_phone($data['phone']);
        if ($phone === null) {
            return $this->respond(['status' => 422, 'message' => 'Nomor WhatsApp tidak valid. Contoh: 0812 3456 7890.', 'errors' => ['phone' => 'Nomor tidak valid.']], 422);
        }
        if ($data['delivery'] === 'antar' && mb_strlen($data['address']) < 8) {
            return $this->respond(['status' => 422, 'message' => 'Tulis alamat lengkap untuk pengantaran.', 'errors' => ['address' => 'Alamat terlalu pendek.']], 422);
        }

        $db = db_connect();
        $db->transStart();
        $product = (new ProductModel())->where('is_active', 1)->find((int) $data['product_id']);
        if ($product === null) {
            $db->transComplete();

            return $this->respond(['status' => 404, 'message' => 'Warna ini sudah tidak dijual.'], 404);
        }
        $qty = (int) $data['qty'];
        // kurangi stok hanya kalau masih cukup (satu perintah UPDATE, aman dari pesanan bersamaan)
        $db->table('products')->set('stock', 'stock - ' . $qty, false)->where('id', $product['id'])->where('stock >=', $qty)->update();
        if ($db->affectedRows() < 1) {
            $db->transComplete();

            return $this->respond(['status' => 409, 'message' => $product['stock'] > 0 ? "Stok {$product['name']} tinggal {$product['stock']}." : "Stok {$product['name']} sedang habis."], 409);
        }
        $orders = new OrderModel();
        $order  = [
            'code'         => $orders->makeCode(),
            'product_id'   => $product['id'],
            'product_name' => $product['name'],
            'hex'          => $product['hex'],
            'qty'          => $qty,
            'unit_price'   => $product['price'],
            'total'        => $product['price'] * $qty,
            'name'         => strip_tags($data['name']),
            'phone'        => $phone,
            'delivery'     => $data['delivery'],
            'address'      => $data['delivery'] === 'antar' ? strip_tags($data['address']) : null,
            'note'         => $data['note'] !== '' ? strip_tags($data['note']) : null,
            'status'       => 'baru',
            'ip'           => $this->request->getIPAddress(),
        ];
        $orders->insert($order);
        $db->transComplete();
        if (! $db->transStatus()) {
            return $this->respond(['status' => 500, 'message' => 'Pesanan gagal disimpan. Coba lagi.'], 500);
        }

        $text = "Halo {$cfg->name}, saya {$order['name']}. Konfirmasi pesanan {$order['code']}: Fabulous Pods {$order['product_name']} × {$qty} = " . rupiah($order['total']) . '.';

        return $this->respondCreated([
            'code'     => $order['code'],
            'product'  => $order['product_name'],
            'qty'      => $qty,
            'total'    => $order['total'],
            'whatsapp' => wa_url($cfg->whatsapp, $text),
            'message'  => "Pesanan {$order['code']} tersimpan.",
        ]);
    }
}
