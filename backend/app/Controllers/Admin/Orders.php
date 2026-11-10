<?php

namespace App\Controllers\Admin;

use App\Controllers\BaseController;
use App\Models\OrderModel;

class Orders extends BaseController
{
    public function index()
    {
        $status = (string) $this->request->getGet('status');
        $q      = trim((string) $this->request->getGet('q'));
        $m      = new OrderModel();
        if (isset(config('Store')->orderStatuses[$status])) {
            $m->where('status', $status);
        }
        if ($q !== '') {
            $m->groupStart()->like('code', $q)->orLike('name', $q)->orLike('phone', $q)->groupEnd();
        }

        return view('admin/orders/index', ['title' => 'Pesanan', 'orders' => $m->orderBy('id', 'DESC')->findAll(200), 'status' => $status, 'q' => $q]);
    }

    /** Ganti status. Kalau dibatalkan, stok dikembalikan; kalau batal dibuka lagi, stok dipotong lagi. */
    public function updateStatus(int $id)
    {
        $m      = new OrderModel();
        $order  = $m->find($id) ?? throw new \CodeIgniter\Exceptions\PageNotFoundException();
        $status = (string) $this->request->getPost('status');
        $labels = config('Store')->orderStatuses;
        if (! isset($labels[$status]) || $status === $order['status']) {
            return redirect()->back();
        }
        $db = db_connect();
        $db->transStart();
        if ($order['product_id']) {
            if ($status === 'batal') {
                $db->table('products')->set('stock', 'stock + ' . (int) $order['qty'], false)->where('id', $order['product_id'])->update();
            } elseif ($order['status'] === 'batal') {
                $db->table('products')->set('stock', 'stock - ' . (int) $order['qty'], false)->where('id', $order['product_id'])->where('stock >=', (int) $order['qty'])->update();
                if ($db->affectedRows() < 1) {
                    $db->transComplete();

                    return redirect()->back()->with('error', 'Stok ' . $order['product_name'] . ' tidak cukup untuk membuka lagi pesanan ini.');
                }
            }
        }
        $m->update($id, ['status' => $status]);
        $db->transComplete();

        return redirect()->back()->with('success', esc($order['code']) . ' sekarang ' . $labels[$status] . '.');
    }

    public function delete(int $id)
    {
        $m     = new OrderModel();
        $order = $m->find($id) ?? throw new \CodeIgniter\Exceptions\PageNotFoundException();
        if ($order['status'] === 'baru' || $order['status'] === 'diproses') {
            // pesanan yang belum dikirim mengembalikan stok saat dihapus
            db_connect()->table('products')->set('stock', 'stock + ' . (int) $order['qty'], false)->where('id', $order['product_id'])->update();
        }
        $m->delete($id);

        return redirect()->back()->with('success', 'Pesanan ' . esc($order['code']) . ' dihapus.');
    }

    public function export()
    {
        $rows = (new OrderModel())->orderBy('id', 'DESC')->findAll();
        $out  = fopen('php://temp', 'w+');
        fwrite($out, "\xEF\xBB\xBF"); // supaya Excel membaca huruf dengan benar
        fputcsv($out, ['Kode', 'Tanggal', 'Warna', 'Jumlah', 'Harga satuan', 'Total', 'Nama', 'WhatsApp', 'Pengiriman', 'Alamat', 'Catatan', 'Status'], ';');
        foreach ($rows as $o) {
            fputcsv($out, [$o['code'], $o['created_at'], $o['product_name'], $o['qty'], $o['unit_price'], $o['total'], $o['name'], $o['phone'], $o['delivery'], $o['address'], $o['note'], $o['status']], ';');
        }
        rewind($out);

        return $this->response->setHeader('Content-Type', 'text/csv; charset=utf-8')
            ->setHeader('Content-Disposition', 'attachment; filename="pesanan-fabulous-' . date('Ymd') . '.csv"')
            ->setBody(stream_get_contents($out));
    }
}
