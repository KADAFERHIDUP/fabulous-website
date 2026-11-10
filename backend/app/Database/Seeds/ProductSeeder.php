<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

/** Delapan warna case. Harga dan stok adalah contoh; ubah lewat panel admin. */
class ProductSeeder extends Seeder
{
    public function run()
    {
        $now    = date('Y-m-d H:i:s');
        $colors = [
            ['teal-laut', 'Teal Laut', '#344d52'],
            ['cokelat-kopi', 'Cokelat Kopi', '#4e3b37'],
            ['biru-denim', 'Biru Denim', '#5e6c79'],
            ['hijau-hutan', 'Hijau Hutan', '#0c221f'],
            ['hijau-sage', 'Hijau Sage', '#4d7764'],
            ['biru-malam', 'Biru Malam', '#0d2b3f'],
            ['hitam-kulit', 'Hitam Kulit', '#3a3b3f'],
            ['emas-zaitun', 'Emas Zaitun', '#aea572'],
        ];
        $rows = [];
        foreach ($colors as $i => [$slug, $name, $hex]) {
            $rows[] = ['slug' => $slug, 'name' => $name, 'hex' => $hex, 'price' => 1299000, 'stock' => 10, 'is_active' => 1, 'sort' => $i, 'created_at' => $now, 'updated_at' => $now];
        }
        $this->db->table('products')->insertBatch($rows);
    }
}
