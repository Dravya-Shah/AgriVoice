// server.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors()); // in production, limit to your frontend origin

// Temporary uploads dir
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const id = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${id}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image uploads are allowed"), false);
};

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 }, fileFilter });

let diseases = [];
// Configure these env vars or defaults
const MODEL_PATH = process.env.MODEL_PATH || path.join(__dirname, "models", "best.pt");
const PYTHON_PATH = process.env.PYTHON_PATH || "python"; // or "python3"

app.post("/detect/image/yolo", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });

  const inputPath = req.file.path;
  const outFilename = `${path.basename(inputPath, path.extname(inputPath))}-annotated.jpg`;
  const outputPath = path.join(uploadDir, outFilename);

  // Run the Python script (detect.py)
  const detectScript = path.join(__dirname, "detect2.py");
  const args = [detectScript, MODEL_PATH, inputPath, outputPath];

  const py = spawn(PYTHON_PATH, args);

  let stdout = "";
  let stderr = "";

  py.stdout.on("data", (d) => (stdout += d.toString()));
  py.stderr.on("data", (d) => (stderr += d.toString()));

  py.on("error", (err) => {
    console.error("Failed to start Python process:", err);
  });

  py.on("close", async (code) => {
    try {
      if (code !== 0) {
        console.error("Python exited with code", code, "stderr:", stderr, "stdout:", stdout);
        // cleanup
        try { fs.unlinkSync(inputPath); } catch (e) {}
        return res.status(500).json({ error: "Detection failed", details: stderr || stdout });
      }

      // Try to parse JSON from stdout (detect.py writes JSON to stdout)
      let parsed = null;
      try {
        parsed = JSON.parse(stdout);
      } catch (e) {
        // if stdout had extra text, attempt to extract a JSON object substring
        const match = stdout.match(/{[\s\S]*}/);
        if (match) {
          try {
            parsed = JSON.parse(match[0]);
          } catch (err) {
            parsed = null;
          }
        }
      }

      diseases = (parsed && Array.isArray(parsed.diseases)) ? parsed.diseases : [];

      // Ensure output image exists
      if (!fs.existsSync(outputPath)) {
        // if python returned an error in parsed JSON, forward it
        try { fs.unlinkSync(inputPath); } catch (e) {}
        return res.status(500).json({ error: "Output image not found", details: parsed || stderr });
      }

      // Read output image and convert to base64
      const imageBuffer = fs.readFileSync(outputPath);
      const imageBase64 = imageBuffer.toString("base64");

      // Respond with both diseases and base64 image
      res.json({
        diseases,
        image_base64: imageBase64, // frontend will prefix with data:image/jpeg;base64,
      });

      // cleanup temp files
      try { fs.unlinkSync(inputPath); } catch (e) {}
      try { fs.unlinkSync(outputPath); } catch (e) {}

    } catch (err) {
      console.error("Server error:", err);
      try { fs.unlinkSync(inputPath); } catch (e) {}
      try { fs.unlinkSync(outputPath); } catch (e) {}
      res.status(500).json({ error: "Server error" });
    }
  });
});


app.use(express.json({ limit: "10mb" }));

// URL of your Gradio app
const GRADIO_URL = "https://4af133933be2ee4b47.gradio.live"; // change if needed

// tweak the query however you like
function tweakQuestion(original) {
  // example: append server-side prefix and normalize whitespace
  const prefix = diseases;
  return `${prefix}\n${String(original || "").trim()}`;
}

async function connectGradioClient() {
  // dynamic import so this file can stay CommonJS
  const { Client } = await import("@gradio/client");
  return Client.connect(GRADIO_URL);
}

/**
 * POST /ask
 * Body (JSON) OR FormData:
 *  - question: string
 *  - imageUrl: optional string (URL to an image)  OR
 *  - image: optional file upload (multipart/form-data) field name "image"
 */
app.post("/ask", upload.single("image"), async (req, res) => {
  try {
    const rawQuestion = req.body.question || (req.body && req.body.question) || "";
    const tweaked = tweakQuestion(rawQuestion);

    // Prepare image blob (if any)
    let blob = null;

    // Option 1: file uploaded via multipart/form-data (multer puts buffer at req.file.buffer)
    if (req.file && req.file.buffer) {
      // determine mime from originalname or from multer file info
      const mime = req.file.mimetype || "application/octet-stream";
      // Node has a global Blob in modern versions; create one from buffer:
      blob = new Blob([req.file.buffer], { type: mime });
    } else if (req.body.imageUrl) {
      // Option 2: user provided image URL (download it)
      const imageUrl = req.body.imageUrl;
      // use global fetch (Node 18+). If you don't have it, install node-fetch and use that.
      const resp = await fetch(imageUrl);
      if (!resp.ok) throw new Error(`Failed to download image: ${resp.status}`);
      const arrayBuffer = await resp.arrayBuffer();
      // attempt to get content-type
      const mime = resp.headers.get("content-type") || "application/octet-stream";
      blob = new Blob([arrayBuffer], { type: mime });
    }

    // Connect to Gradio and call the endpoint
    const client = await connectGradioClient();

    // Build payload. Adjust endpoint name and parameter keys to match your Gradio function signature.
    // You showed client.predict("/answer_question", { question: "...", image: exampleImage })
    const payload = { question: tweaked };
    if (blob) payload.image = blob;

    const result = await client.predict("/answer_question", payload);

    // result structure depends on the Gradio app. We simply forward it.
    res.json({ success: true, gradio: result });
  } catch (err) {
    console.error("Error /ask:", err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
