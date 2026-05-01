<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAuthToken
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->header('Authorization')) {
            return response()->json(['message' => 'Akses ditolak: Token tidak ditemukan'], 401);
        }
        return $next($request);
    }
}
