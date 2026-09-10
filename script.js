// UI Elements
const videoUrlInput = document.getElementById("videoUrl");
const downloadBtn = document.getElementById("downloadBtn");
const loadingBox = document.getElementById("loading");
const errorMsg = document.getElementById("errorMsg");
const resultCard = document.getElementById("resultCard");
const videoThumb = document.getElementById("videoThumb");
const saveBtn = document.getElementById("saveBtn");

downloadBtn.addEventListener("click", async () => {
  const url = videoUrlInput.value.trim();

  if (!url) {
    showError("Please paste an Instagram link first!");
    return;
  }

  // Reset UI
  if (errorMsg) errorMsg.classList.add("hidden");
  if (resultCard) resultCard.classList.add("hidden");
  if (loadingBox) loadingBox.classList.remove("hidden");
  downloadBtn.disabled = true;

  try {
    const res = await fetch(`https://reel-drop.onrender.com/api/download?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "Could not fetch media.");
    }

    // Thumbnail bypass using global CDN proxy
    if (videoThumb && data.thumbnailLink) {
      videoThumb.referrerPolicy = "no-referrer";
      videoThumb.src = `https://wsrv.nl/?url=${encodeURIComponent(data.thumbnailLink)}`;
      videoThumb.classList.remove("hidden");
    }

    // Direct Download route
    if (saveBtn && data.downloadLink) {
      saveBtn.href = `http://localhost:5000/api/download-video?videoUrl=${encodeURIComponent(data.downloadLink)}`;
      saveBtn.removeAttribute("target");
      saveBtn.textContent = "Download Video";
    }

    if (resultCard) {
      resultCard.classList.remove("hidden");
    }

  } catch (err) {
    console.error("Frontend Error:", err);
    showError(err.message || "Failed to download! Make sure backend is running.");
  } finally {
    if (loadingBox) loadingBox.classList.add("hidden");
    downloadBtn.disabled = false;
  }
});

function showError(msg) {
  if (errorMsg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove("hidden");
  }
}
