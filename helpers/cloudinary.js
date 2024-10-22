require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// console.log(process.env.CLOUDINARY_CLOUD_NAME)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new multer.memoryStorage();

async function imageUploadUtility(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
    folder: "Green-Assist-Demo",
  });

  return result;
}

const upload = multer({ storage });

module.exports = { upload, imageUploadUtility };
