<?php

namespace App\Http\Controllers;

use App\Models\Pengaduan;
use Illuminate\Http\Request;

class PengaduanController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nama_mahasiswa' => 'required',
            'isi_laporan' => 'required',
        ]);

        $pengaduan = Pengaduan::create([
            'nim' => '24105111107',
            'nama_mahasiswa' => $request->nama_mahasiswa,
            'isi_laporan' => $request->isi_laporan,
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'Laporan pengaduan berhasil dikirim!',
            'data' => $pengaduan
        ], 201);
    }

    public function index()
    {
        return response()->json(Pengaduan::all());
    }
}