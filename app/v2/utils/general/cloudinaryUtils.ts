import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { Request } from 'express';
import { config } from '../../config/env';

// -------------------- CLOUDINARY CONFIG --------------------
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

// -------------------- TEMP STORAGE --------------------
const getTempStorage = () =>
  multer.diskStorage({
    destination: function (_req, _file, cb) {
      const uploadDir = 'uploads/temp';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (_req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });

// -------------------- IMAGE FILTER --------------------
const imageFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image uploads are allowed!'));
};

// -------------------- MULTER SETUP --------------------
export const singleImageUpload = multer({
  storage: getTempStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: imageFilter,
}).single('image'); // field name in form-data

// -------------------- CLOUDINARY UPLOAD --------------------
export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format?: string;
  resource_type?: string;
  bytes?: number;
}

export const uploadToCloudinary = async (
  filePath: string,
  folder = 'university_sports'
): Promise<CloudinaryUploadResult> => {
  const compressedPath = filePath.replace(/(\.[\w]+)$/, '-compressed$1');

  // Compress before upload
  await sharp(filePath)
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(compressedPath);

  // Ensure file <= ~1.5MB
  const stats = fs.statSync(compressedPath);
  if (stats.size > 1.5 * 1024 * 1024) {
    await sharp(compressedPath)
      .jpeg({ quality: 70 })
      .toFile(compressedPath);
  }

  // Upload
  const result = await cloudinary.uploader.upload(compressedPath, {
    folder,
    resource_type: 'image',
  });

  // Cleanup local temp files
  try { fs.unlinkSync(filePath); } catch (_) {}
  try { fs.unlinkSync(compressedPath); } catch (_) {}

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
    format: result.format,
    resource_type: result.resource_type,
    bytes: result.bytes,
  };
};

// -------------------- HANDLE SINGLE IMAGE UPLOAD --------------------
export const handleSingleImageUpload = async (
  file: Express.Multer.File,
  folder?: string
): Promise<string> => {
  const uploaded = await uploadToCloudinary(file.path, folder);
  return uploaded.secure_url;
};

export { cloudinary };