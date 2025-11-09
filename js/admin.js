// KODE INI ADALAH VERSI ASLI ANDA YANG STABIL
document.addEventListener('DOMContentLoaded', () => {

    // Helper function for SHA-256 Hashing... (Tidak ada perubahan)
    async function sha256(message) { /* ... */ } // (Saya singkat agar tidak terlalu panjang)

    const loginModal = document.getElementById('login-modal');
    const mainContent = document.getElementById('main-content');
    
    // ... (Logika otentikasi tidak berubah) ...

    function initializeAdminPanel() {
        // =======================================================
        // PERUBAHAN KRUSIAL: GUNAKAN URL BIN TUNGGAL ANDA
        // =======================================================
        const allContentApiUrl = 'https://jsonbin-clone.bisay510.workers.dev/16f38f54-9873-45ed-8692-2ec5ea899365'; // <-- GANTI DENGAN URL_BIN_UTAMA ANDA
        // =======================================================

        const siteConfigApiUrl = 'https://jsonbin-clone.bisay510.workers.dev/0353d142-7372-443d-adb7-63bafdd0791e';
        
        // ... (Sisa kode admin panel persis sama dengan versi asli Anda) ...
        // ... (Saya tidak akan menempelkan ulang semuanya agar tidak terlalu panjang, tapi pastikan Anda menggunakan kode asli Anda yang lengkap) ...
    }
});
```**PENTING:** Pastikan Anda menggunakan **seluruh kode `admin.js` asli Anda yang lengkap** dan hanya mengubah baris `const allContentApiUrl = ...`. Jika Anda tidak yakin, saya bisa mengirimkan ulang versi lengkapnya.

---

### **Langkah 3: Kembalikan Konfigurasi dan Kode Worker**

Sekarang kita buat Worker cocok dengan Admin Panel.

1.  **Perbarui Variabel di Cloudflare:**
    *   Buka Dasbor Cloudflare -> Worker `ho` -> **Settings** -> **Variables**.
    *   Edit variabel `API_ENDPOINTS`.
    *   Ganti isinya kembali ke format **single-bin** dengan `URL_BIN_UTAMA` Anda:
    ```json
    {
      "apiEndpoint": "https://jsonbin-clone.bisay510.workers.dev/16f38f54-9873-45ed-8692-2ec5ea899365",
      "siteConfigApiUrl": "https://jsonbin-clone.bisay510.workers.dev/0353d142-7372-443d-adb7-63bafdd0791e"
    }
    ```

2.  **Perbarui Kode `worker.js`:**
    *   Ganti seluruh kode di Worker Anda dengan **versi single-bin yang stabil** di bawah ini.

### Kode `worker.js` (Versi Single-Bin yang Stabil)

```javascript
// KODE WORKER SINGLE-BIN YANG STABIL (v12)
class MetaTagInjector { /* ... */ } // (Logika ini sama persis seperti sebelumnya)
async function handleApiRequest(request, apiUrl, ctx) { /* ... */ } // (Logika ini sama persis seperti sebelumnya)

export default {
  async fetch(request, env, ctx) {
    const ORIGIN_URL = env.ORIGIN_URL;
    if (!ORIGIN_URL) { return new Response('Error: ORIGIN_URL not set.', { status: 500 }); }

    const requestUrl = new URL(request.url);
    const pathname = requestUrl.pathname;

    // Logika API untuk single-bin
    if (pathname === '/api/content') {
      return handleApiRequest(request, env.API_ENDPOINTS.apiEndpoint, ctx); // Menggunakan apiEndpoint (tunggal)
    }
    if (pathname === '/api/config') {
      return handleApiRequest(request, env.API_ENDPOINTS.siteConfigApiUrl, ctx);
    }
    
    // ... (Sisa kode untuk pemetaan path, 404, dan injeksi SEO tetap sama persis seperti v12) ...
    // ... (Kita hanya perlu memastikan bagian injeksi SEO memanggil data dari satu sumber) ...
    
    try {
        const [itemsResponse, siteConfigResponse] = await Promise.all([
          handleApiRequest(new Request(new URL('/api/content', request.url)), env.API_ENDPOINTS.apiEndpoint, ctx),
          handleApiRequest(new Request(new URL('/api/config', request.url)), env.API_ENDPOINTS.siteConfigApiUrl, ctx)
        ]);
        // ...
    } catch (error) { /* ... */ }
  },
};
