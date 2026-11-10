<?php

namespace App\Controllers\Api;

use App\Models\ProductModel;

class Products extends BaseApi
{
    public function index()
    {
        $m = new ProductModel();

        return $this->respond(['data' => array_map([$m, 'public'], $m->listed())]);
    }
}
