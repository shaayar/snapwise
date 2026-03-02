import formidable from "formidable";
import fs from "fs";
import sharp from "sharp";
import Tesseract from "tesseract.js";
import { classify } from "../engine/intentEngine.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Upload failed" });

    const file = files.screenshot;

    const buffer = fs.readFileSync(file.filepath);

    const processed = await sharp(buffer)
      .grayscale()
      .normalize()
      .sharpen()
      .toBuffer();

    const { data: { text } } = await Tesseract.recognize(
      processed,
      "eng"
    );

    const result = classify(text);

    res.json({
      category: result.category,
      confidence: result.confidence,
      scoreBreakdown: result.scoreBreakdown
    });
  });
}