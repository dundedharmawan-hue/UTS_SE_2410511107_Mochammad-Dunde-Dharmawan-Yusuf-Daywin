<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PengaduanController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/pengaduan', [PengaduanController::class, 'index']);
Route::post('/pengaduan', [PengaduanController::class, 'store']);
Route::put('/pengaduan/{id}', [PengaduanController::class, 'update']);
Route::delete('/pengaduan/{id}', [PengaduanController::class, 'destroy']);