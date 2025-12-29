const https = require('https');
const fs = require('fs');
const path = require('path');

const MANGA_DIR = path.join(__dirname, '..', 'public', 'manga', 'test');

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function createTestMangaPages() {
  console.log('Creating test manga pages...\n');

  const chapters = [
    { num: 1, color: '0a0e27' },
    { num: 2, color: '16213e' },
    { num: 3, color: '1a2332' }
  ];

  for (const chapter of chapters) {
    const chapterDir = path.join(MANGA_DIR, `chapter${chapter.num}`);
    
    console.log(`Creating Chapter ${chapter.num} pages...`);
    
    for (let page = 1; page <= 5; page++) {
      const filename = `page${page}.jpg`;
      const filepath = path.join(chapterDir, filename);
      const url = `https://via.placeholder.com/800x1200/${chapter.color}/ffffff.jpg?text=Chapter+${chapter.num}+Page+${page}`;
      
      try {
        await downloadImage(url, filepath);
        console.log(`  ✓ Downloaded ${filename}`);
      } catch (error) {
        console.error(`  ✗ Failed to download ${filename}:`, error.message);
      }
    }
    console.log('');
  }

  console.log('✅ All test manga pages created!');
  
  // List all created files
  console.log('\nCreated files:');
  for (const chapter of chapters) {
    const chapterDir = path.join(MANGA_DIR, `chapter${chapter.num}`);
    const files = fs.readdirSync(chapterDir);
    console.log(`  Chapter ${chapter.num}: ${files.length} pages`);
  }
}

createTestMangaPages().catch(console.error);
