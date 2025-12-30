#!/usr/bin/env node

/**
 * Upload manga and anime files to Cloudflare R2
 * Usage: node scripts/upload-to-r2.js
 */

const { S3Client, PutObjectCommand, ListBucketsCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

// Configuration from environment variables
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error("❌ Missing R2 credentials in environment variables:");
  console.error("   - R2_ACCOUNT_ID");
  console.error("   - R2_ACCESS_KEY_ID");
  console.error("   - R2_SECRET_ACCESS_KEY");
  console.error("\nGet these from: Cloudflare Dashboard → R2 → Manage R2 API Tokens");
  process.exit(1);
}

// Initialize S3 client for R2
const client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// Get content type from file extension
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.json': 'application/json',
  };
  return types[ext] || 'application/octet-stream';
}

// Recursively get all files in a directory
async function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const items = await readdir(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      files.push(...await getAllFiles(fullPath, baseDir));
    } else {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      files.push({ fullPath, relativePath });
    }
  }

  return files;
}

// Upload a single file to R2
async function uploadFile(localPath, bucketName, remotePath) {
  try {
    const fileContent = await readFile(localPath);
    const contentType = getContentType(localPath);

    await client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: remotePath,
      Body: fileContent,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000', // Cache for 1 year
    }));

    return true;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Upload directory to R2
async function uploadDirectory(localPath, bucketName, remotePrefix = "") {
  console.log(`\n📤 Uploading from ${localPath} to ${bucketName}/${remotePrefix}`);
  
  if (!fs.existsSync(localPath)) {
    console.log(`   ⚠️  Directory not found: ${localPath}`);
    return { uploaded: 0, failed: 0, skipped: 1 };
  }

  const files = await getAllFiles(localPath);
  let uploaded = 0;
  let failed = 0;

  console.log(`   Found ${files.length} files`);

  for (const { fullPath, relativePath } of files) {
    const remotePath = remotePrefix 
      ? `${remotePrefix}/${relativePath}`.replace(/\/+/g, '/')
      : relativePath;
    
    process.stdout.write(`   Uploading: ${relativePath}...`);
    
    const success = await uploadFile(fullPath, bucketName, remotePath);
    
    if (success) {
      console.log(` ✓`);
      uploaded++;
    } else {
      failed++;
    }
  }

  return { uploaded, failed, skipped: 0 };
}

// Main upload function
async function main() {
  console.log("🚀 Cloudflare R2 Upload Script\n");
  console.log("=" .repeat(60));

  // Test connection
  try {
    await client.send(new ListBucketsCommand({}));
    console.log("✓ Connected to Cloudflare R2");
  } catch (error) {
    console.error("❌ Failed to connect to R2:", error.message);
    process.exit(1);
  }

  const results = {
    manga: { uploaded: 0, failed: 0, skipped: 0 },
    anime: { uploaded: 0, failed: 0, skipped: 0 },
  };

  // Upload manga files
  const mangaPath = path.join(process.cwd(), "public", "manga");
  results.manga = await uploadDirectory(mangaPath, "manga-storage", "manga");

  // Upload anime files (if directory exists)
  const animePath = path.join(process.cwd(), "public", "anime");
  if (fs.existsSync(animePath)) {
    results.anime = await uploadDirectory(animePath, "anime-storage", "anime");
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Upload Summary");
  console.log("=".repeat(60));
  console.log(`Manga Files:`);
  console.log(`  ✓ Uploaded: ${results.manga.uploaded}`);
  console.log(`  ✗ Failed: ${results.manga.failed}`);
  console.log(`  ⊘ Skipped: ${results.manga.skipped}`);
  
  if (fs.existsSync(animePath)) {
    console.log(`\nAnime Files:`);
    console.log(`  ✓ Uploaded: ${results.anime.uploaded}`);
    console.log(`  ✗ Failed: ${results.anime.failed}`);
    console.log(`  ⊘ Skipped: ${results.anime.skipped}`);
  }

  const totalUploaded = results.manga.uploaded + results.anime.uploaded;
  const totalFailed = results.manga.failed + results.anime.failed;

  console.log("\n" + "=".repeat(60));
  console.log(`Total: ${totalUploaded} uploaded, ${totalFailed} failed`);
  
  if (totalFailed > 0) {
    console.log("\n⚠️  Some files failed to upload. Check errors above.");
    process.exit(1);
  } else {
    console.log("\n✅ All files uploaded successfully!");
  }
}

// Run script
main().catch(error => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
