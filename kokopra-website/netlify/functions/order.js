
exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json"
  };

  // Hanya menerima POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        message: "Metode tidak diizinkan."
      })
    };
  }

  try {
    // Membaca data pesanan
    const data = JSON.parse(event.body || "{}");

    const required = [
      "nama",
      "whatsapp",
      "jumlah",
      "satuan",
      "pengiriman",
      "pembayaran"
    ];

    // Validasi data wajib
    if (
      required.some(
        key => !String(data[key] ?? "").trim()
      )
    ) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: "Mohon lengkapi semua data pesanan."
        })
      };
    }

    // Validasi jumlah
    const jumlah = Number(data.jumlah);

    if (!Number.isFinite(jumlah) || jumlah <= 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: "Jumlah pesanan tidak valid."
        })
      };
    }

    // Validasi alamat
    if (
      data.pengiriman !== "Diambil langsung" &&
      !String(data.alamat || "").trim()
    ) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: "Alamat pengiriman wajib diisi."
        })
      };
    }

    // Membaca Environment Variables Netlify
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error("Konfigurasi Telegram belum lengkap.");

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          message: "Konfigurasi Telegram belum tersedia."
        })
      };
    }

    // Membersihkan karakter yang tidak diperlukan
    const clean = (value) =>
      String(value ?? "-")
        .replace(/[<>&]/g, "")
        .trim();

    // Membuat pesan pesanan
    const text = [
      "📦 PESANAN BARU — KOKOPRA",
      "",
      `Nama: ${clean(data.nama)}`,
      `WhatsApp: ${clean(data.whatsapp)}`,
      `Jumlah: ${jumlah} ${clean(data.satuan)}`,
      `Pengiriman: ${clean(data.pengiriman)}`,
      `Alamat: ${clean(data.alamat || "Ambil langsung")}`,
      `Pembayaran: ${clean(data.pembayaran)}`,
      `Catatan: ${clean(data.catatan || "-")}`,
      "",
      "Mohon hubungi pembeli untuk konfirmasi harga, stok, ongkir, dan pembayaran."
    ].join("\n");

    // Mengirim pesanan ke Telegram
    const telegram = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text
        })
      }
    );

    // Membaca respons Telegram
    let result;

    try {
      result = await telegram.json();
    } catch {
      console.error("Respons Telegram tidak valid.");

      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          message: "Respons Telegram tidak dapat dibaca."
        })
      };
    }

    // Menangani kegagalan Telegram
    if (!telegram.ok || !result.ok) {
      console.error("Telegram API Error:", {
        status: telegram.status,
        error_code: result.error_code,
        description: result.description
      });

      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          message: "Pesanan gagal dikirim ke Telegram.",
          error_code: result.error_code || null,
          description: result.description || "Kesalahan tidak diketahui."
        })
      };
    }

    // Jika berhasil
    console.log("Pesanan berhasil dikirim ke Telegram.");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Pesanan berhasil dikirim ke Telegram."
      })
    };

  } catch (error) {
    console.error("Order Function Error:", error.message);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Terjadi kesalahan saat memproses pesanan."
      })
    };
  }
};
