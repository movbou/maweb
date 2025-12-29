const https = require('https');
const fs = require('fs');
const path = require('path');

const MANGA_DIR = path.join(__dirname, '..', 'public', 'manga', 'test');

// Simple function to download image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function main() {
  console.log('📚 Creating test manga pages...\n');

  const chapters = [
    { num: 1, color: '0a0e27', name: 'Dark Blue' },
    { num: 2, color: '16213e', name: 'Navy' },
    { num: 3, color: '1a2332', name: 'Slate' }
  ];

  let totalDownloaded = 0;
  let totalFailed = 0;

  for (const chapter of chapters) {
    console.log(`Creating Chapter ${chapter.num} (${chapter.name})...`);
    const chapterDir = path.join(MANGA_DIR, `chapter${chapter.num}`);

    for (let page = 1; page <= 5; page++) {
      const filename = `page${page}.jpg`;
      const filepath = path.join(chapterDir, filename);
      
      // Skip if file already exists
      if (fs.existsSync(filepath)) {
        console.log(`  ⏭️  ${filename} already exists`);
        continue;
      }

      const url = `https://via.placeholder.com/800x1200/${chapter.color}/ffffff.jpg?text=Chapter+${chapter.num}+Page+${page}`;

      try {
        await downloadImage(url, filepath);
        console.log(`  ✅ Downloaded ${filename}`);
        totalDownloaded++;
      } catch (error) {
        console.error(`  ❌ Failed ${filename}: ${error.message}`);
        totalFailed++;
      }
    }
    console.log('');
  }

  console.log('📊 Summary:');
  console.log(`  ✅ Downloaded: ${totalDownloaded} pages`);
  console.log(`  ❌ Failed: ${totalFailed} pages`);
  console.log('');

  // Verify created files
  console.log('📁 Verifying files...');
  let totalFiles = 0;
  for (const chapter of chapters) {
    const chapterDir = path.join(MANGA_DIR, `chapter${chapter.num}`);
    if (fs.existsSync(chapterDir)) {
      const files = fs.readdirSync(chapterDir).filter(f => f.endsWith('.jpg'));
      console.log(`  Chapter ${chapter.num}: ${files.length} pages`);
      totalFiles += files.length;
    }
  }

  console.log(`\n✨ Total: ${totalFiles} manga pages ready!`);
  
  if (totalFiles > 0) {
    console.log('\n🎉 Test manga created successfully!');
    console.log('\nYou can now:');
    console.log('  1. Visit http://localhost:3000/manga/browse');
    console.log('  2. Click on any manga');
    console.log('  3. Click "Start Reading" to test the reader');
    console.log('\nOr run tests with: npm run test:manga');
  }
}

main().catch(console.error);
