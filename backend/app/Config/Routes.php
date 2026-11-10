<?php

use App\Filters\AdminAuth;
use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

// Halaman utama = frontend (folder frontend/ disalin ke public/ oleh installer)
$routes->get('/', 'Home::index');

// ---------- API JSON untuk frontend ----------
$routes->group('api', ['namespace' => 'App\Controllers\Api', 'filter' => 'cors'], static function ($routes) {
    $routes->get('health', 'Health::index');
    $routes->get('products', 'Products::index');
    $routes->post('orders', 'Orders::create');
    $routes->options('(:any)', static fn () => service('response')->setStatusCode(204));
});

// ---------- Login admin ----------
$routes->get('admin/login', 'Auth::login');
$routes->post('admin/login', 'Auth::attempt', ['filter' => 'csrf']);
$routes->get('admin/logout', 'Auth::logout');

// ---------- Panel admin (wajib login, semua POST dicek CSRF) ----------
$routes->group('admin', ['namespace' => 'App\Controllers\Admin', 'filter' => AdminAuth::class], static function ($routes) {
    $routes->get('/', 'Dashboard::index');

    $routes->get('pesanan', 'Orders::index');
    $routes->get('pesanan/csv', 'Orders::export');
    $routes->post('pesanan/(:num)/status', 'Orders::updateStatus/$1');
    $routes->post('pesanan/(:num)/hapus', 'Orders::delete/$1');

    $routes->get('warna', 'Products::index');
    $routes->get('warna/tambah', 'Products::new');
    $routes->post('warna', 'Products::create');
    $routes->get('warna/(:num)/edit', 'Products::edit/$1');
    $routes->post('warna/(:num)', 'Products::update/$1');
    $routes->post('warna/(:num)/tampil', 'Products::toggle/$1');
    $routes->post('warna/(:num)/hapus', 'Products::delete/$1');
});
