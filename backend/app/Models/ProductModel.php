<?php

namespace App\Models;

use CodeIgniter\Model;

class ProductModel extends Model
{
    protected $table         = 'products';
    protected $returnType    = 'array';
    protected $useTimestamps = true;
    protected $allowedFields = ['slug', 'name', 'hex', 'price', 'stock', 'is_active', 'sort'];

    public function listed(bool $activeOnly = true): array
    {
        if ($activeOnly) {
            $this->where('is_active', 1);
        }

        return $this->orderBy('sort')->orderBy('id')->findAll();
    }

    public function public(array $p): array
    {
        return ['id' => (int) $p['id'], 'slug' => $p['slug'], 'name' => $p['name'], 'hex' => $p['hex'], 'price' => (int) $p['price'], 'stock' => (int) $p['stock'], 'available' => (int) $p['stock'] > 0];
    }
}
