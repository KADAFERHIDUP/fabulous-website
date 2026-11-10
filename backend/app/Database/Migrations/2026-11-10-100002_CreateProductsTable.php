<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/** Varian produk: satu baris per warna case Fabulous Pods. */
class CreateProductsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'         => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'slug'       => ['type' => 'VARCHAR', 'constraint' => 60],
            'name'       => ['type' => 'VARCHAR', 'constraint' => 60],
            'hex'        => ['type' => 'CHAR', 'constraint' => 7],
            'price'      => ['type' => 'INT', 'unsigned' => true],
            'stock'      => ['type' => 'INT', 'unsigned' => true, 'default' => 0],
            'is_active'  => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],
            'sort'       => ['type' => 'SMALLINT', 'default' => 0],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('slug');
        $this->forge->createTable('products');
    }

    public function down()
    {
        $this->forge->dropTable('products');
    }
}
