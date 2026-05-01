<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $table = 'categories'; // Sesuaikan dengan nama tabel di database

    protected $fillable = ['name_category'];

    // Relasi ke Pengaduan (Satu kategori punya banyak pengaduan)
    public function complaints()
    {
        return $this->hasMany(Pengaduan::class);
    }
}