#!/usr/bin/env node

/**
 * Optimize images before uploading to R2
 * Converts images to WebP format and compresses them
 * Usage: node scripts/optimize-images.js [input-dir] [output-dir]
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  webpQuality: 85,
  jpegQuality: 85,
  pngQuality: 85,
  maxWidth: 2000,
  maxHeight: 3000,
  formats: ['.jpg', '.jpeg', '.png'],
};

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getAllImageFiles(dir, baseDir = dir) {
  const files = [];
  const items = await fs.readdir(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      files.push(...await getAllImageFiles(fullPath, baseDir));
    } else {
      const ext = path.extname(item.name).toLowerCase();
      if (CONFIG.formats.includes(ext)) {
        const relativePath = path.relative(baseDir, fullPath);
        files.push({ fullPath, relativePath });
      }
    }
  }

  return files;
}

async function optimizeImage(inputPath, outputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const outputDir = path.dirname(outputPath);
  
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });
  
  let pipeline = sharp(inputPath);
  
  // Get metadata
  const metadata = await pipeline.metadata();
  
  // Resize if too large
  if (metadata.width > CONFIG.maxWidth || metadata.height > CONFIG.maxHeight) {
    pipeline = pipeline.resize(CONFIG.maxWidth, CONFIG.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }
  
  // Convert to WebP or optimize
  const outputExt = '.webp'; // Always convert to WebP for best compression
  const finalOutputPath = outputPath.replace(ext, outputExt);
  
  await pipeline
    .webp({ quality: CONFIG.webpQuality })
    .toFile(finalOutputPath);
  
  // Get file sizes
  const inputStats = await fs.stat(inputPath);
  const outputStats = await fs.stat(finalOutputPath);
  
  const savedBytes = inputStats.size - outputStats.size;
  const savedPercent = ((savedBytes / inputStats.size) * 100).toFixed(1);
  
  return {
    inputPath,
    outputPath: finalOutputPath,
    inputSize: inputStats.size,
    outputSize: outputStats.size,
    savedBytes,
    savedPercent,
  };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function main() {
  const inputDir = process.argv[2] || path.join(process.cwd(), 'public', 'manga');
  const outputDir = process.argv[3] || path.join(process.cwd(), 'public', 'manga-optimized');
  
  console.log('🖼️  Image Optimization Script');
  console.log('=' .repeat(60));
  console.log(`Input:  ${inputDir}`);
  console.log(`Output: ${outputDir}`);
  console.log('=' .repeat(60));
  
  // Check if input exists
  if (!await fileExists(inputDir)) {
    console.error(`❌ Input directory not found: ${inputDir}`);
    process.exit(1);
  }
  
  // Get all image files
  console.log('\n📁 Scanning for images...');
  const images = await getAllImageFiles(inputDir);
  
  if (images.length === 0) {
    console.log('⚠️  No images found');
    process.exit(0);
  }
  
  console.log(`✓ Found ${images.length} images\n`);
  
  // Optimize each image
  const results = {
    total: images.length,
    processed: 0,
    failed: 0,
    totalInputSize: 0,
    totalOutputSize: 0,
  };
  
  for (const { fullPath, relativePath } of images) {
    const outputPath = path.join(outputDir, relativePath);
    
    process.stdout.write(`Processing: ${relativePath}...`);
    
    try {
      const result = await optimizeImage(fullPath, outputPath);
      
      results.processed++;
      results.totalInputSize += result.inputSize;
      results.totalOutputSize += result.outputSize;
      
      console.log(` ✓ (saved ${result.savedPercent}%)`);
    } catch (error) {
      console.log(` ✗ Error: ${error.message}`);
      results.failed++;
    }
  }
  
  // Summary
  const totalSaved = results.totalInputSize - results.totalOutputSize;
  const totalSavedPercent = ((totalSaved / results.totalInputSize) * 100).toFixed(1);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Optimization Summary');
  console.log('='.repeat(60));
  console.log(`Total images:     ${results.total}`);
  console.log(`Processed:        ${results.processed}`);
  console.log(`Failed:           ${results.failed}`);
  console.log(`Original size:    ${formatBytes(results.totalInputSize)}`);
  console.log(`Optimized size:   ${formatBytes(results.totalOutputSize)}`);
  console.log(`Space saved:      ${formatBytes(totalSaved)} (${totalSavedPercent}%)`);
  console.log('='.repeat(60));
  
  if (results.failed > 0) {
    console.log('\n⚠️  Some images failed to process');
    process.exit(1);
  } else {
    console.log('\n✅ All images optimized successfully!');
    console.log(`\nNext step: Upload optimized images to R2`);
    console.log(`Command: R2_SOURCE_DIR="${outputDir}" npm run upload:r2`);
  }
}

// Run script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
