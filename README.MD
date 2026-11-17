# Event Management & Registration API

RESTful API untuk manajemen acara (*event*) dan sistem pendaftaran peserta dengan batas kuota. Proyek ini dibangun menggunakan arsitektur berlapis (*Layered Architecture*) yang memisahkan tanggung jawab antara pengelolaan HTTP (*Controller*) dan logika bisnis (*Service*), dilengkapi autentikasi berbasis JWT, kontrol akses berbasis peran (*Role-Based Access Control*), serta transaksi database atomik untuk menjaga konsistensi kuota peserta.

---

## Fitur Utama

* **Autentikasi & Otorisasi (RBAC):** Registrasi dan login pengguna dengan *one-way password hashing* (`bcryptjs`), serta validasi token JWT untuk membedakan hak akses antara `admin` dan `user`.
* **Manajemen Event (CRUD):** Pengelolaan data event khusus `admin`, serta akses publik untuk melihat detail dan daftar event dengan dukungan *pagination*, pencarian judul (`search`), dan filter ketersediaan kuota (`available`).
* **Pendaftaran Event Atomik:** Proses pendaftaran dan pembatalan event dibungkus dalam `prisma.$transaction` dengan operator atomik (`increment`/`decrement`) serta *composite unique constraint* (`@@unique([userId, eventId])`) untuk mencegah pendaftaran ganda maupun *race condition* pada sisa kuota.
* **Centralized Error Handling:** Penanganan error terpusat (`AppError` & `errorMiddleware`) yang memastikan seluruh *response* sukses maupun gagal mengikuti format JSON yang seragam.

---

## Tech Stack

* **Runtime & Framework:** Node.js, Express.js
* **Database & ORM:** PostgreSQL, Prisma ORM
* **Keamanan & Autentikasi:** JSON Web Token (`jsonwebtoken`), `bcryptjs`
* **Utilities:** `dotenv`, `nodemon`

---

## Struktur Proyek

```text
├── prisma/
│   └── schema.prisma           # Skema model database (User, Event, Registration)
├── src/
│   ├── config/                 # Konfigurasi koneksi Prisma Client
│   ├── controllers/            # Handler request & response HTTP
│   ├── middlewares/            # Autentikasi JWT, otorisasi role, & global error handler
│   ├── routes/                 # Definisi endpoint API
│   ├── services/               # Logika bisnis & transaksi database
│   ├── utils/                  # Helper hashing, JWT, AppError, & formatter response
│   └── app.js                  # Entry point aplikasi Express
├── .env.example                # Template variabel environment
├── .gitignore
├── package.json
└── README.md
```

---

## Panduan Instalasi & Menjalankan Server

### 1. Clone Repository
```bash
git clone [https://github.com/](https://github.com/)attayaghalin/event-organizer.git
cd event-organizer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env`, lalu sesuaikan nilainya dengan konfigurasi lokalmu:
```bash
cp .env.example .env
```

Isi file `.env`:
```env
PORT=3000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/NAMA_DATABASE?schema=public"
JWT_SECRET="ganti_dengan_secret_key_yang_kuat"
JWT_EXPIRES_IN="1d"
```

### 4. Migrasi Database
Pastikan layanan PostgreSQL sudah berjalan, lalu jalankan migrasi Prisma untuk membuat tabel di database:
```bash
npx prisma migrate dev
```

### 5. Jalankan Server
```bash
# Mode development (dengan auto-reload nodemon)
npm run dev

# Mode production
npm start
```
Server akan berjalan di `http://localhost:3000`.

---

## Dokumentasi Endpoint API

### 1. Autentikasi (`/api/auth`)

| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Mendaftarkan akun pengguna baru (default role: `user`) |
| `POST` | `/api/auth/login` | Public | Login pengguna dan mendapatkan token JWT |

### 2. Manajemen Event (`/api/events`)

| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Public | Mengambil daftar event (mendukung *pagination*, *search*, & filter kuota) |
| `GET` | `/api/events/:id` | Public | Mengambil detail informasi satu event berdasarkan ID |
| `POST` | `/api/events` | Admin | Membuat event baru |
| `PUT` | `/api/events/:id` | Admin | Memperbarui data event berdasarkan ID |
| `DELETE` | `/api/events/:id` | Admin | Menghapus event berdasarkan ID |

**Query Parameters pada `GET /api/events`:**
* `page` *(opsional, default: `1`)* — Nomor halaman yang ingin ditampilkan.
* `limit` *(opsional, default: `10`)* — Jumlah data per halaman.
* `search` *(opsional)* — Kata kunci pencarian berdasarkan judul event (*case-insensitive*).
* `available` *(opsional)* — Isi dengan `true` untuk hanya menampilkan event yang memiliki sisa kuota (`quota > 0`).

### 3. Pendaftaran Event (`/api/events` & `/api/users`)

| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/events/:id/register` | User (Login) | Mendaftarkan diri ke event dan mengurangi kuota secara atomik |
| `DELETE` | `/api/events/:id/unregister` | User (Login) | Membatalkan pendaftaran event dan mengembalikan kuota |
| `GET` | `/api/users/registrations` | User (Login) | Melihat seluruh daftar event yang sedang diikuti oleh pengguna |

---

## Format Standar Response

Seluruh endpoint mengembalikan struktur JSON yang konsisten:

**Contoh Response Sukses (`200` / `201`):**
```json
{
  "success": true,
  "message": "Berhasil mendaftar ke event",
  "data": {
    "id": 1,
    "userId": 2,
    "eventId": 1,
    "registeredAt": "2026-11-17T15:30:00.000Z"
  }
}
```

**Contoh Response Error (`400` / `401` / `403` / `404` / `500`):**
```json
{
  "success": false,
  "message": "Kuota event sudah penuh"
}
```

---

## Pengujian API (Postman)

Koleksi pengujian lengkap tersedia di dalam repository ini pada file `Event Manager API.postman_collection.json`.

1. Buka aplikasi **Postman**, klik tombol **Import**, lalu pilih file `.json` tersebut.
2. Atur variabel `base_url` menjadi `http://localhost:3000`.
3. Jalankan endpoint **Login** terlebih dahulu, lalu salin token JWT dari response ke dalam variabel `token` (atau tab **Authorization $\rightarrow$ Bearer Token**) untuk menguji endpoint yang terproteksi.