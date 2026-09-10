const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// RapidAPI Credentials
const RAPIDAPI_KEY = "d0e970ffd0mshf995a8f21c0cc3fp1792f4jsnbe2cf2a7d2ac";
const RAPIDAPI_HOST = "instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com";

// 1. Convert & Extract Info
app.get("/api/download", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ success: false, message: "URL is required" });
  }

  try {
    const response = await axios.get(`https://${RAPIDAPI_HOST}/convert`, {
      params: { url },
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    });

    const data = response.data;
    const mediaItem = data.media && data.media[0] ? data.media[0] : null;

    const downloadLink = (mediaItem && (mediaItem.url || mediaItem.downloadUrl || mediaItem.video)) || data.url;
    const rawThumbnail = (mediaItem && (mediaItem.thumbnail || mediaItem.thumb)) || data.thumbnail;

    if (!downloadLink) {
      return res.status(404).json({ success: false, message: "Video link not found" });
    }

    res.json({
      success: true,
      downloadLink: downloadLink,
      thumbnailLink: rawThumbnail || "",
    });
  } catch (err) {
    console.error("Backend Error:", err.message);
    res.status(500).json({ success: false, message: "API fetch failed" });
  }
});

// 2. Direct Video Downloader Stream
app.get("/api/download-video", async (req, res) => {
  const { videoUrl } = req.query;

  if (!videoUrl) {
    return res.status(400).send("Video URL is required");
  }

  try {
    const videoResponse = await axios({
      url: decodeURIComponent(videoUrl),
      method: "GET",
      responseType: "stream",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.instagram.com/",
        "Accept": "*/*"
      },
    });

    res.setHeader("Content-Disposition", 'attachment; filename="instagram_video.mp4"');
    res.setHeader("Content-Type", "video/mp4");

    videoResponse.data.pipe(res);
  } catch (err) {
    console.error("Video Download Error:", err.message);
    res.status(500).send("Failed to download video stream");
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});