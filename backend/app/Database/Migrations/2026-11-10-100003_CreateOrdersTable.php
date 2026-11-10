<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/** Pesanan dari website. Nama, warna, dan harga disalin saat memesan supaya riwayat tidak berubah. */
class CreateOrdersTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'           => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'code'         => ['type' => 'VARCHAR', 'constraint' => 20],
            'product_id'   => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'product_name' => ['type' => 'VARCHAR', 'constraint' => 60],
            'hex'          => ['type' => 'CHAR', 'constraint' => 7],
            'qty'          => ['type' => 'SMALLINT', 'unsigned' => true],
            'unit_price'   => ['type' => 'INT', 'unsigned' => true],
            'total'        => ['type' => 'INT', 'unsigned' => true],
            'name'         => ['type' => 'VARCHAR', 'constraint' => 80],
            'phone'        => ['type' => 'VARCHAR', 'constraint' => 20],
            'delivery'     => ['type' => 'VARCHAR', 'constraint' => 10, 'default' => 'antar'],
            'address'      => ['type' => 'TEXT', 'null' => true],
            'note'         => ['type' => 'VARCHAR', 'constraint' => 300, 'null' => true],
            'status'       => ['type' => 'VARCHAR', 'constraint' => 12, 'default' => 'baru'],
            'ip'           => ['type' => 'VARCHAR', 'constraint' => 45, 'null' => true],
            'created_at'   => ['type' => 'DATETIME', 'null' => true],
            'updated_at'   => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('code');
        $this->forge->addKey('status');
        $this->forge->addForeignKey('product_id', 'products', 'id', 'CASCADE', 'SET NULL');
        $this->forge->createTable('orders');
    }

    public function down()
    {
        $this->forge->dropTable('orders');
    }
}
