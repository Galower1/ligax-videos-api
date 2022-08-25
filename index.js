const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const PORT = process.env.PORT || 8000;
const VIDEOS_FOLDER = "./videos";

const app = express();

app.use(express.json());
app.use(cors());
app.use(fileUpload());
app.use("/videos", express.static("videos"));

app.get("/videos", (req, res, next) => {
  try {
    const videos = fs.readdirSync(VIDEOS_FOLDER);
    const filePaths = videos.map(
      (video, index) =>
        index && {
          id: index,
          video_url: `${req.protocol}://${req.rawHeaders[1]}/videos/${video}`,
        }
    );

    res.json(filePaths);
  } catch (err) {
    next(err);
  }
});

app.post("/videos", (req, res, next) => {
  try {
    let sampleFile;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded.");
    }

    sampleFile = req.files.file;

    sampleFile.mv(path.join(VIDEOS_FOLDER, sampleFile.name), function (err) {
      if (err) return res.status(500).send(err);
      res.json({ message: "Received file" });
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
