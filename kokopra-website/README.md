# KOKOPRA — Website Promosi dan Pemesanan Produk Kopra

Website statis tanpa database dan tanpa login. Formulir pemesanan diteruskan ke Telegram melalui Netlify Functions.

## Membuka proyek
1. Ekstrak ZIP.
2. Buka folder `kokopra-website` di Visual Studio Code.
3. Untuk melihat tampilan saja, gunakan ekstensi Live Server dan buka `index.html`.
4. Untuk menguji pengiriman pesanan, jalankan melalui Netlify Dev (bukan Live Server).

## Persiapan Telegram
1. Buat bot melalui akun resmi `@BotFather` di Telegram dan salin token bot.
2. Buka chat bot yang baru dibuat, tekan Start, lalu kirim satu pesan.
3. Dapatkan chat ID melalui `https://api.telegram.org/bot<TOKEN_BOT_ANDA>/getUpdates` setelah mengganti placeholder dengan token sendiri.
4. Simpan token dan chat ID sebagai environment variables di Netlify:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`

Jangan pernah menaruh token bot di `script.js`, `index.html`, atau repository GitHub.

## Uji lokal dengan Netlify Dev
Memerlukan Node.js dan Netlify CLI. Di Terminal VS Code, jalankan:

```bash
npm install -g netlify-cli
```

Buat file `.env` di folder utama (jangan unggah ke GitHub):

```env
TELEGRAM_BOT_TOKEN=token_bot_anda
TELEGRAM_CHAT_ID=chat_id_anda
```

Lalu jalankan:

```bash
netlify dev
```

Buka alamat lokal yang ditampilkan Netlify CLI (umumnya `http://localhost:8888`).

## Deploy
Hubungkan repository GitHub ke Netlify. Build command dapat dikosongkan dan publish directory diisi `.`. Tambahkan kedua environment variables Telegram di pengaturan site Netlify, lalu deploy.

## Catatan operasional
- Tidak menggunakan database, akun pembeli, atau dashboard admin.
- Informasi produk dan konten website diubah melalui file `index.html`.
- Harga, stok, biaya kirim, dan pembayaran dikonfirmasi manual oleh penjual.
- Pilihan COD, transfer bank, dan QRIS hanya merekam pilihan pembeli. Website tidak memproses pembayaran otomatis.
- Untuk keamanan, batasi spam pada fungsi pemesanan sebelum penggunaan publik berskala besar.
