<?php

namespace App\Controllers\Admin;

use App\Controllers\BaseController;

class Dashboard extends BaseController
{
    public function index()
    {
        $db    = db_connect();
        $stats = [
            'new'     => $db->table('orders')->where('status', 'baru')->countAllResults(),
            'active'  => $db->table('orders')->whereIn('status', ['diproses', 'dikirim'])->countAllResults(),
            'revenue' => (int) ($db->table('orders')->selectSum('total')->where('status', 'selesai')->get()->getRow()->total ?? 0),
            'sold'    => (int) ($db->table('orders')->selectSum('qty')->where('status !=', 'batal')->get()->getRow()->qty ?? 0),
            'low'     => $db->table('products')->where('is_active', 1)->where('stock <=', 3)->countAllResults(),
        ];
        $recent = $db->table('orders')->orderBy('id', 'DESC')->limit(8)->get()->getResultArray();
        $stock  = $db->table('products')->orderBy('sort')->get()->getResultArray();

        return view('admin/dashboard', ['title' => 'Dashboard', 'stats' => $stats, 'recent' => $recent, 'stock' => $stock]);
    }
}
