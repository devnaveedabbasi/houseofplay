// CLOUDINARY CODE COMMENTED FOR TESTING
// import { v2 as cloudinary } from 'cloudinary';
// 
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
// 
// /**
//  * Uploads a buffer to Cloudinary.
//  * @param {Buffer} fileBuffer - The buffer of the file.
//  * @param {String} folder - The folder to upload to (e.g. raw-materials/thumbnails)
//  * @returns {Promise<Object>} Resolves with { url, public_id }
//  */
// export const uploadToCloudinary = (fileBuffer, folder) => {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       { folder },
//       (error, result) => {
//         if (error) {
//           reject(error);
//         } else {
//           resolve({ url: result.secure_url, public_id: result.public_id });
//         }
//       }
//     );
//     uploadStream.end(fileBuffer);
//   });
// };
// 
// export default cloudinary;

// LOCAL UPLOAD (testing only)
import fs from "fs";
import path from "path";

export const uploadToLocal = (buffer, folder, filename) => {
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);
  // Return relative URL so frontend can display it
  return `/uploads/${folder}/${filename}`;
};
