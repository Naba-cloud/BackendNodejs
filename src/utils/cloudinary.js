import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_KEY_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File uploaded On Cloudinary", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};
const deleteFromCloudinary = async (localFilePath) => {
  console.log("localFilePath", localFilePath);
  try {
    if (!localFilePath) return false;
    await cloudinary.uploader.destroy(localFilePath, {
      resource_type: "image",
    });
    console.log("Image deleted successfully");
    return true;
  } catch (error) {
    console.error(error);
    console.log("Failed to delete image from Cloudinary");
    return null;
  }
};
export { uploadOnCloudinary, deleteFromCloudinary };
