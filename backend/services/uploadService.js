import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";

const extensionByMime = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

export function createUploadService(config) {
  const cloudinaryConfigured = Boolean(
    config.cloudinaryCloudName && config.cloudinaryApiKey && config.cloudinaryApiSecret
  );

  if (cloudinaryConfigured) {
    cloudinary.config({
      cloud_name: config.cloudinaryCloudName,
      api_key: config.cloudinaryApiKey,
      api_secret: config.cloudinaryApiSecret,
      secure: true
    });
  }

  return {
    mode: cloudinaryConfigured ? "cloudinary" : "local",

    async upload(file) {
      if (cloudinaryConfigured) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "rapido/blogs",
              resource_type: "image",
              transformation: [{ width: 1600, height: 900, crop: "limit", quality: "auto", fetch_format: "auto" }]
            },
            (error, uploadResult) => (error ? reject(error) : resolve(uploadResult))
          );
          stream.end(file.buffer);
        });
        return {
          url: result.secure_url,
          publicId: result.public_id,
          storageType: "cloudinary"
        };
      }

      await fs.mkdir(config.uploadDir, { recursive: true });
      const extension = extensionByMime[file.mimetype] || ".jpg";
      const fileName = `${crypto.randomUUID()}${extension}`;
      await fs.writeFile(path.join(config.uploadDir, fileName), file.buffer);
      return {
        url: `${config.apiPublicUrl}/uploads/${fileName}`,
        publicId: `local:${fileName}`,
        storageType: "local"
      };
    },

    async remove(asset) {
      if (!asset?.publicId) return;
      if (asset.storageType === "cloudinary" && cloudinaryConfigured) {
        await cloudinary.uploader.destroy(asset.publicId, { resource_type: "image" });
        return;
      }
      if (asset.storageType === "local" && asset.publicId.startsWith("local:")) {
        const fileName = path.basename(asset.publicId.slice(6));
        await fs.rm(path.join(config.uploadDir, fileName), { force: true });
      }
    }
  };
}
