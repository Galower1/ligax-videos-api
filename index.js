const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const crypto = require("crypto");

const PORT = process.env.PORT || 8000;
const VIDEOS_FOLDER = "./videos";

const app = express();

app.use(express.json());
app.use(cors());
app.use(fileUpload());
app.use("/videos", express.static("videos"));

const videos = [];

app.get("/videos", (req, res, next) => {
  try {
    res.json(videos);
  } catch (err) {
    next(err);
  }
});

app.delete("/videos/:videoId", (req, res, next) => {
  try {
    const { videoId } = req.params;

    const index = videos.findIndex((value) => value.id === videoId);

    const videoObject = videos[index];

    videos.splice(index, 1);

    fs.unlinkSync(`./videos/${videoObject.file_name}`);

    res
      .status(204)
      .json({ message: "Deleted file", file_name: videoObject.file_name });
  } catch (error) {
    next(error);
  }
});

app.post("/videos", (req, res, next) => {
  try {
    let sampleFile;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No files received" });
    }

    sampleFile = req.files.file;

    sampleFile.mv(path.join(VIDEOS_FOLDER, sampleFile.name), function (err) {
      if (err) return res.status(500).send(err);

      videos.push({
        id: crypto.randomUUID(),
        file_name: sampleFile.name,
        video_url: `${req.protocol}://${req.rawHeaders[1]}/videos/${sampleFile.name}`,
      });

      res.json({ message: "Received file", currentVideos: videos });
    });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500);
});

app.listen(PORT, () => console.log("Listening 8000"));
