const fs = require('fs');
const path = require('path');

const MANGA_DIR = path.join(__dirname, '..', 'public', 'manga', 'test');

// Create a simple SVG image as a placeholder
function createSvgImage(chapterNum, pageNum, color) {
  return `<svg width="800" height="1200" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="1200" fill="#${color}"/>
  <text x="400" y="550" font-family="Arial" font-size="48" fill="white" text-anchor="middle" font-weight="bold">
    Chapter ${chapterNum}
  </text>
  <text x="400" y="650" font-family="Arial" font-size="72" fill="white" text-anchor="middle" font-weight="bold">
    Page ${pageNum}
  </text>
</svg>`;
}

async function main() {
  console.log('📚 Creating test manga pages with SVG...\n');

  const chapters = [
    { num: 1, color: '0a0e27', name: 'Dark Blue' },
    { num: 2, color: '16213e', name: 'Navy' },
    { num: 3, color: '1a2332', name: 'Slate' }
  ];

  let totalCreated = 0;

  for (const chapter of chapters) {
    console.log(`Creating Chapter ${chapter.num} (${chapter.name})...`);
    const chapterDir = path.join(MANGA_DIR, `chapter${chapter.num}`);

    for (let page = 1; page <= 5; page++) {
      const filename = `page${page}.svg`;
      const filepath = path.join(chapterDir, filename);
      
      try {
        const svgContent = createSvgImage(chapter.num, page, chapter.color);
        fs.writeFileSync(filepath, svgContent, 'utf8');
        console.log(`  ✅ Created ${filename}`);
        totalCreated++;
      } catch (error) {
        console.error(`  ❌ Failed ${filename}: ${error.message}`);
      }
    }
    console.log('');
  }

  console.log('📊 Summary:');
  console.log(`  ✅ Created: ${totalCreated} pages`);
  console.log('');

  // Verify created files
  console.log('📁 Verifying files...');
  let totalFiles = 0;
  for (const chapter of chapters) {
    const chapterDir = path.join(MANGA_DIR, `chapter${chapter.num}`);
    if (fs.existsSync(chapterDir)) {
      const files = fs.readdirSync(chapterDir).filter(f => f.endsWith('.svg'));
      console.log(`  Chapter ${chapter.num}: ${files.length} pages`);
      totalFiles += files.length;
    }
  }

  console.log(`\n✨ Total: ${totalFiles} manga pages ready!`);
  
  if (totalFiles > 0) {
    console.log('\n🎉 Test manga created successfully!');
    console.log('\nYou can now test the reader at:');
    console.log('  http://localhost:3000/manga/1/read/1');
  }
}

main().catch(console.error);
