// UI Elements
const videoUrlInput = document.getElementById("videoUrl");
const downloadBtn = document.getElementById("downloadBtn");
const loadingBox = document.getElementById("loading");
const errorMsg = document.getElementById("errorMsg");
const resultCard = document.getElementById("resultCard");
const videoThumb = document.getElementById("videoThumb");
const saveBtn = document.getElementById("saveBtn");

// RapidAPI Credentials (KK Creation)
const API_KEY = "d0e970ffd0mshf995a8f21c0cc3fp1792f4jsnbe2cf2a7d2ac";
const API_HOST = "instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com";

// Helper function: kisi bhi object/array se string URL nikalne ke liye
function extractUrl(val) {
  if (!val) return null;
  if (typeof val === "string" && (val.startsWith("http://") || val.startsWith("https://"))) {
    return val;
  }
  if (typeof val === "object") {
    if (Array.isArray(val) && val.length > 0) {
      return extractUrl(val[0]);
    }
    // Object ke andar url, download_url, video, link dhoondho
    return (
      extractUrl(val.url) ||
      extractUrl(val.download_url) ||
      extractUrl(val.video) ||
      extractUrl(val.video_url) ||
      extractUrl(val.link) ||
      extractUrl(val.media) ||
      null
    );
  }
  return null;
}

// Click Event
downloadBtn.addEventListener("click", async () => {
  const url = videoUrlInput.value.trim();

  hideError();
  if (resultCard) resultCard.classList.add("hidden");

  if (!url) {
    showError("Please paste an Instagram link first!");
    return;
  }

  // Loading State
  if (loadingBox) loadingBox.classList.remove("hidden");
  downloadBtn.disabled = true;

  try {
    const endpoint = `https://${API_HOST}/convert?url=${encodeURIComponent(url)}`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": API_HOST
      }
    });

    const data = await response.json();
    console.log("RapidAPI Full Response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch video from API");
    }

    // Saari sambhav keys se URL nikalna (Object recursion ke saath)
    let downloadLink = 
      extractUrl(data.media) ||
      extractUrl(data.url) ||
      extractUrl(data.download_url) ||
      extractUrl(data.video_url) ||
      extractUrl(data.result) ||
      extractUrl(data.data) ||
      extractUrl(data);

    let thumbnailLink = 
      extractUrl(data.thumbnail) ||
      extractUrl(data.thumbnail_url) ||
      extractUrl(data.thumb) ||
      (data.result && extractUrl(data.result[0]?.thumbnail)) ||
      (data.data && extractUrl(data.data?.thumbnail)) ||
      "";

    if (!downloadLink) {
      throw new Error("Could not extract video link. Please check Console log.");
    }

    // UI Updates
    if (thumbnailLink && videoThumb) {
      videoThumb.src = thumbnailLink;
      videoThumb.classList.remove("hidden");
    }

    if (saveBtn) {
      saveBtn.href = downloadLink;
      saveBtn.removeAttribute("download");
      saveBtn.target = "_blank";
      saveBtn.rel = "noopener noreferrer";
      saveBtn.textContent = "Open / Download Video";
    }

    if (resultCard) {
      resultCard.classList.remove("hidden");
    }

  } catch (err) {
    console.error("Fetch Error:", err);
    showError(err.message || "Kuch gadbad hui! Link aur API response check karein.");
  } finally {
    if (loadingBox) loadingBox.classList.add("hidden");
    downloadBtn.disabled = false;
  }
});

// Helper Functions
function showError(message) {
  if (errorMsg) {
    errorMsg.textContent = message;
    errorMsg.classList.remove("hidden");
  }
}

function hideError() {
  if (errorMsg) {
    errorMsg.classList.add("hidden");
    errorMsg.textContent = "";
  }
}