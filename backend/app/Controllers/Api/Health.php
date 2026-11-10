<?php

namespace App\Controllers\Api;

class Health extends BaseApi
{
    public function index()
    {
        return $this->respond([
            'ok'       => true,
            'name'     => config('Store')->name,
            'products' => db_connect()->table('products')->where('is_active', 1)->countAllResults(),
            'time'     => date('c'),
        ]);
    }
}
