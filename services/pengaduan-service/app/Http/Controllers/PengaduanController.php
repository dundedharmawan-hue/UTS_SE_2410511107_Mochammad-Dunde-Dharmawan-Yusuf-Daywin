<?php

namespace App\Http\Controllers;

use App\Models\Pengaduan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PengaduanController extends Controller
{
    public function index()
    {
        return response()->json(Pengaduan::with(['user', 'category'])->paginate(10));
    }

    public function store(Request $request)
    {
        // Validasi (tetap gunakan nama yang mudah dimengerti untuk input)
        $request->validate([
            'nim' => 'required',
            'nama_mahasiswa' => 'required',
            'isi_laporan' => 'required',
        ]);

        // Simpan ke database sesuai struktur screenshot kamu
        $pengaduan = Pengaduan::create([
            'nim' => $request->nim,
            'nama_mahasiswa' => $request->nama_mahasiswa,
            'isi_laporan' => $request->isi_laporan,
            'status' => 'pending'
        ]);

        // Inter-service Communication (Service ke-3 di Port 5000)
        try {
            \Illuminate\Support\Facades\Http::post('http://localhost:5000/log-activity', [
                'message' => "Laporan baru masuk dari {$request->nama_mahasiswa} (NIM: {$request->nim})"
            ]);
        } catch (\Exception $e) {
            // Jangan biarkan aplikasi mati hanya karena log service tidak aktif
        }

        return response()->json([
            'message' => 'Laporan pengaduan berhasil dikirim!',
            'data' => $pengaduan
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $pengaduan = Pengaduan::find($id);

        if (!$pengaduan) {
            return response()->json(['message' => 'Laporan tidak ditemukan'], 404);
        }

        $pengaduan->update($request->all());

        Http::post('http://localhost:5000/log-activity', [
            'message' => "Pengaduan ID {$id} diperbarui."
        ]);

        return response()->json([
            'message' => 'Laporan berhasil diperbarui!',
            'data' => $pengaduan
        ]);
    }

    public function destroy($id)
    {
        $pengaduan = Pengaduan::find($id);

        if (!$pengaduan) {
            return response()->json(['message' => 'Laporan tidak ditemukan'], 404);
        }

        $pengaduan->delete();

        Http::post('http://localhost:5000/log-activity', [
            'message' => "Pengaduan ID {$id} telah dihapus."
        ]);

        return response()->json(['message' => 'Laporan berhasil dihapus']);
    }
}