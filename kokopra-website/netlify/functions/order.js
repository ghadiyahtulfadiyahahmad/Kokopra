exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json"
  };

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
    const data = JSON.parse(event.body || "{}");

    const required = [
      "nama",
      "whatsapp",
      "jumlah",
      "satuan",
      "pengiriman",
      "pembayaran"
    ];

    if (required.some(key => !String(data[key] ?? "").trim())) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: "Mohon lengkapi data wajib."
        })
      };
    }

    if (!Number.isFinite(Number(data.jumlah)) ||
        Number(data.jumlah) <= 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: "Jumlah pesanan tidak valid."
        })
      };
    }

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

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error("Konfigurasi Telegram belum lengkap.");

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          message: "Konfigurasi Telegram belum lengkap."
        })
      };
    }

    const clean = value =>
      String(value || "-").replace(/[<>&]/g, "");

    const text = [
      "📦 PESANAN BARU — KOKOPRA",
      "",
      `Nama: ${clean(data.nama)}`,
      `WhatsApp: ${clean(data.whatsapp)}`,
      `Jumlah: ${clean(data.jumlah)} ${clean(data.satuan)}`,
      `Pengiriman: ${clean(data.pengiriman)}`,
      `Alamat: ${clean(data.alamat || "Ambil langsung")}`,
      `Pembayaran: ${clean(data.pembayaran)}`,
      `Catatan: ${clean(data.catatan || "-")}`,
      "",
      "Mohon hubungi pembeli untuk konfirmasi harga, stok, ongkir, dan pembayaran."
    ].join("\n");

    const telegram = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text
        })
      }
    );

    const result = await telegram.json();

    if (!telegram.ok || !result.ok) {
      console.error("Telegram API error:", {
        status: telegram.status,
        description: result.description
      });

      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          message: "Pengiriman Telegram gagal. Silakan coba lagi."
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Pesanan berhasil dikirim."
      })
    };

  } catch (error) {
    console.error("Order function error:", error.message);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Terjadi kesalahan pada server."
      })
    };
  }
};
