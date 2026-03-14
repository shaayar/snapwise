const Tesseract = require("tesseract.js");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

async function preprocessImage(imagePath) {
  const processedPath = imagePath.replace(/\.(png|jpg|jpeg)/, "_processed.png");

  await sharp(imagePath)
    .grayscale()
    .normalize()
    .sharpen()
    .toFile(processedPath);

  return processedPath;
}

async function extractText(imagePath) {
  try {
    const processedImage = await preprocessImage(imagePath);

    const { data: { text, confidence } } = await Tesseract.recognize(
      processedImage,
      "eng"
    );

    // Optional cleanup: delete processed image
    fs.unlinkSync(processedImage);

    return { text, confidence };
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Failed to extract text");
  }
}

module.exports = { extractText };