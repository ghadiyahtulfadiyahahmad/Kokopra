const form = document.getElementById("orderForm");
const shipping = document.getElementById("shipping");
const addressField = document.getElementById("addressField");
const address = document.getElementById("address");
const message = document.getElementById("formMessage");
const submitButton = document.getElementById("submitButton");

document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("menuToggle").addEventListener("click", () => {
  const nav = document.getElementById("mainNav");
  const opened = nav.classList.toggle("open");
  document.getElementById("menuToggle").setAttribute("aria-expanded", String(opened));
});
document.querySelectorAll("#mainNav a").forEach(link => link.addEventListener("click", () => {
  document.getElementById("mainNav").classList.remove("open");
  document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
}));

function syncAddress() {
  const needed = shipping.value !== "Diambil langsung";
  addressField.style.display = needed ? "flex" : "none";
  address.required = needed;
  if (!needed) address.value = "";
}
shipping.addEventListener("change", syncAddress);
syncAddress();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  message.className = "form-message";

  const data = Object.fromEntries(new FormData(form).entries());
  data.jumlah = Number(data.jumlah);

  if (!Number.isFinite(data.jumlah) || data.jumlah <= 0) {
    message.textContent = "Jumlah pesanan harus lebih besar dari 0.";
    message.classList.add("error");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Mengirim pesanan...";

  try {
    const response = await fetch("/.netlify/functions/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Pesanan belum berhasil dikirim.");

    message.textContent = "Pesanan berhasil dikirim. Penjual akan menghubungi Anda untuk konfirmasi.";
    message.classList.add("success");
    form.reset();
    syncAddress();
  } catch (error) {
    message.textContent = error.message || "Tidak dapat mengirim pesanan. Silakan coba kembali.";
    message.classList.add("error");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Kirim Pesanan ke Penjual <span>↗</span>';
  }
});
