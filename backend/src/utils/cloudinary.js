import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

console.log("===== ENV TEST =====");
console.log("cwd:", process.cwd());
console.log("cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("api key exists:", !!process.env.CLOUDINARY_API_KEY);
console.log("api secret exists:", !!process.env.CLOUDINARY_API_SECRET);
console.log("====================");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (LocalFilePath) => {
  try {
    if (!LocalFilePath) return null;

    const response = await cloudinary.uploader.upload(LocalFilePath, {
      resource_type: "auto",
    });

    console.log("cloudinary response :", response);
    console.log("File upload on cloudinary :", response.url);
    fs.unlinkSync(LocalFilePath);
    return response;
  } catch (error) {
    // fs.unlinkSync(LocalFilePath);
    // return null;
    console.log("CLOUDINARY ERROR:", error);

    if (LocalFilePath && fs.existsSync(LocalFilePath)) {
      fs.unlinkSync(LocalFilePath);
    }

    return null;
  }
};

const deleteFromCloudinary = async (public_id) => {
  try {
    if (!public_id) return null;
    const response = await cloudinary.uploader.destroy(public_id, {
      resource_type: "auto",
    });
    console.log("Cloudinary delete response :", response);
    return response;
  } catch (error) {
    console.log("Cloudinary delete error : ", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
