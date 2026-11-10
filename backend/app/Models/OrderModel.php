<?php

namespace App\Models;

use CodeIgniter\Model;

class OrderModel extends Model
{
    protected $table         = 'orders';
    protected $returnType    = 'array';
    protected $useTimestamps = true;
    protected $allowedFields = ['code', 'product_id', 'product_name', 'hex', 'qty', 'unit_price', 'total', 'name', 'phone', 'delivery', 'address', 'note', 'status', 'ip'];

    /** Kode pesanan pendek yang mudah dibacakan lewat telepon, misalnya FB-261110-K7Q2. */
    public function makeCode(): string
    {
        $abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        do {
            $code = 'FB-' . date('ymd') . '-';
            for ($i = 0; $i < 4; $i++) {
                $code .= $abc[random_int(0, strlen($abc) - 1)];
            }
        } while ($this->where('code', $code)->countAllResults() > 0);

        return $code;
    }
}
