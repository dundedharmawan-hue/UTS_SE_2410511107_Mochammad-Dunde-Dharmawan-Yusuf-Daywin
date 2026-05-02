# UTS Arsitektur Microservices - Sistem Pengaduan Mahasiswa

Proyek ini merupakan implementasi arsitektur microservices untuk sistem pengaduan mahasiswa

## 1. Identitas Mahasiswa
*   **Nama:** Dunde Daywin
*   **NIM:** 24105111107
*   **Kelas:** B

## 2. Cara Menjalankan Program
Jalankan perintah berikut di **3 terminal berbeda**:

1.  **Terminal 1 (Auth Service & API Gateway):**
    cd auth-service && node index.js

2.  **Terminal 2 (Pengaduan Service - Laravel):**
    cd pengaduan-service && php artisan serve --port=8000

3.  **Terminal 3 (Log Service - Node.js):**
    cd log-service && node index.js

## 3. Peta Endpoint (API Route Map)

Seluruh permintaan klien harus melalui **API Gateway (Port 3000)** sebagai gerbang utama sebelum diteruskan ke service tujuan.

| Method | Endpoint | Service Tujuan | Deskripsi |
| :--- | :--- | :--- | :--- |
| **GET** | `/auth/github` | Auth Service | Otorisasi via GitHub OAuth 2.0 (Flow Authorization Code). |
| **POST** | `/auth/login` | Auth Service | Login manual menggunakan Email/Password untuk mendapatkan JWT. |
| **POST** | `/auth/logout` | API Gateway | Invalidasi token menggunakan mekanisme Blacklist di Gateway. |
| **GET** | `/api/pengaduan` | Laravel Service | Mengambil data aduan dengan fitur Paging dan Filtering. |
| **POST** | `/api/pengaduan` | Laravel Service | Input pengaduan baru (Otomatis mengirim data log ke Port 5000). |

## 4. Link Video Demo
https://youtu.be/Fvwtlyh0TG0 