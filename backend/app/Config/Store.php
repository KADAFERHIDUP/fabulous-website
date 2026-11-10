<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

/** Pengaturan toko Fabulous yang dipakai API dan panel admin. */
class Store extends BaseConfig
{
    public string $name     = 'Fabulous';
    public string $whatsapp = '6282276078880';
    public string $city     = 'Lhokseumawe';

    /** Batas jumlah per pesanan, supaya stok tidak habis oleh satu orang. */
    public int $maxQty = 5;

    /** Status pesanan, urut sesuai alur. */
    public array $orderStatuses = [
        'baru'     => 'Baru',
        'diproses' => 'Diproses',
        'dikirim'  => 'Dikirim',
        'selesai'  => 'Selesai',
        'batal'    => 'Batal',
    ];

    public array $deliveries = [
        'antar' => 'Diantar',
        'ambil' => 'Ambil sendiri',
    ];
}
