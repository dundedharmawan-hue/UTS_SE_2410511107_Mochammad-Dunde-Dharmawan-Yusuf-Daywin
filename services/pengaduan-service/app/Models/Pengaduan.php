<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengaduan extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'nim', 
        'nama_mahasiswa', 
        'isi_laporan', 
        'status'
    ];
}
