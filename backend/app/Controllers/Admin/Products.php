<?php

namespace App\Controllers\Admin;

use App\Controllers\BaseController;
use App\Models\ProductModel;

class Products extends BaseController
{
    private ProductModel $products;

    public function __construct()
    {
        $this->products = new ProductModel();
    }

    public function index()
    {
        return view('admin/products/index', ['title' => 'Warna & stok', 'products' => $this->products->listed(false)]);
    }

    public function new()
    {
        return view('admin/products/form', ['title' => 'Tambah warna', 'product' => null]);
    }

    public function create()
    {
        $data = $this->collect();
        if ($data === null) {
            return redirect()->back()->withInput()->with('errors', $this->validator->getErrors());
        }
        $data['slug'] = $this->slug($data['name']);
        $this->products->insert($data);

        return redirect()->to(site_url('admin/warna'))->with('success', esc($data['name']) . ' ditambahkan.');
    }

    public function edit(int $id)
    {
        $p = $this->products->find($id) ?? throw new \CodeIgniter\Exceptions\PageNotFoundException();

        return view('admin/products/form', ['title' => 'Edit ' . $p['name'], 'product' => $p]);
    }

    public function update(int $id)
    {
        $p    = $this->products->find($id) ?? throw new \CodeIgniter\Exceptions\PageNotFoundException();
        $data = $this->collect();
        if ($data === null) {
            return redirect()->back()->withInput()->with('errors', $this->validator->getErrors());
        }
        $this->products->update($p['id'], $data);

        return redirect()->to(site_url('admin/warna'))->with('success', esc($data['name']) . ' disimpan.');
    }

    public function toggle(int $id)
    {
        $p = $this->products->find($id) ?? throw new \CodeIgniter\Exceptions\PageNotFoundException();
        $this->products->update($id, ['is_active' => $p['is_active'] ? 0 : 1]);

        return redirect()->back()->with('success', esc($p['name']) . ($p['is_active'] ? ' disembunyikan dari website.' : ' tampil lagi di website.'));
    }

    public function delete(int $id)
    {
        $p = $this->products->find($id) ?? throw new \CodeIgniter\Exceptions\PageNotFoundException();
        $this->products->delete($id);

        return redirect()->to(site_url('admin/warna'))->with('success', esc($p['name']) . ' dihapus. Pesanan lamanya tetap tersimpan.');
    }

    private function collect(): ?array
    {
        $data          = $this->request->getPost(['name', 'hex', 'price', 'stock', 'sort']);
        $data['price'] = preg_replace('/\D+/', '', (string) $data['price']);
        $rules         = [
            'name'  => 'required|max_length[60]',
            'hex'   => 'required|regex_match[/^#[0-9a-fA-F]{6}$/]',
            'price' => 'required|is_natural_no_zero',
            'stock' => 'required|is_natural',
            'sort'  => 'permit_empty|integer',
        ];
        if (! $this->validateData($data, $rules, ['hex' => ['regex_match' => 'Kode warna harus seperti #344d52.']])) {
            return null;
        }

        return ['name' => trim(strip_tags($data['name'])), 'hex' => strtolower($data['hex']), 'price' => (int) $data['price'], 'stock' => (int) $data['stock'], 'sort' => (int) ($data['sort'] ?: 0), 'is_active' => $this->request->getPost('is_active') ? 1 : 0];
    }

    private function slug(string $name): string
    {
        $base = url_title($name, '-', true) ?: 'warna';
        $slug = $base;
        for ($i = 2; $this->products->where('slug', $slug)->countAllResults() > 0; $i++) {
            $slug = $base . '-' . $i;
        }

        return $slug;
    }
}
