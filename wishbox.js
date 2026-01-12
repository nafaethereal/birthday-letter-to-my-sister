const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyh4KLK1PmRmz1z_YEWjvBzP4ntZj1DdmBJbgtmZ6295pyLlgqJ89qrUhsCHoOf08E9/exec";

const form = document.getElementById("wishForm");
const input = document.getElementById("wishInput");
const success = document.getElementById("wishSuccess");
const finishBtn = document.getElementById("finishBtn");
const overlay = document.getElementById("wishOverlay");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const wishText = input.value.trim();
  if (!wishText) return;

  const submitBtn = form.querySelector("button");
  submitBtn.disabled = true;

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      wish: wishText,
      ua: navigator.userAgent,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.result === "success") {
    
        // 1. Tampilkan overlay dulu (tanpa berat)
        overlay.classList.add("show");
    
        // 2. Hide form SETELAH overlay muncul
        requestAnimationFrame(() => {
          form.classList.add("hidden");
        });
    
        // 3. Ritual selesai
        setTimeout(() => {
          overlay.classList.remove("show");
    
          success.classList.remove("hidden");
          finishBtn.classList.remove("hidden");
        }, 2800);
    
      } else {
        throw new Error(data.message);
      }
    })
    
    .catch((err) => {
      console.error(err);
      alert("Stars are busy right now ✨");
      submitBtn.disabled = false;
    });
});
