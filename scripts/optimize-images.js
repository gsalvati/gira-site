const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIST_DIR = path.resolve(__dirname, '..', 'dist');

// Walk directory recursively
function walk(dir, callback) {
    fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath, callback);
        } else {
            callback(fullPath);
        }
    });
}

async function processImages() {
    const images = [];
    
    // Collect all jpg/jpeg/png images in dist/assets/
    walk(path.join(DIST_DIR, 'assets'), (filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
            images.push(filePath);
        }
    });

    console.log(`🔍 Found ${images.length} images to optimize`);

    const thumbMap = new Map(); // originalPath -> thumbPath

    // Generate thumbnails
    for (const imgPath of images) {
        const dir = path.dirname(imgPath);
        const base = path.basename(imgPath, path.extname(imgPath));
        const thumbPath = path.join(dir, `${base}.thumb.jpg`);

        // Skip if thumb already exists
        if (fs.existsSync(thumbPath)) {
            thumbMap.set(imgPath, thumbPath);
            continue;
        }

        try {
            // Determine thumbnail size based on directory
            const relPath = path.relative(DIST_DIR, imgPath);
            const isApp = relPath.includes('/app/');
            const thumbWidth = isApp ? 200 : 400;
            const thumbHeight = isApp ? 400 : 400;

            await sharp(imgPath)
                .resize(thumbWidth, thumbHeight, { 
                    fit: isApp ? 'cover' : 'cover',
                    position: 'center'
                })
                .jpeg({ quality: 80, progressive: true })
                .toFile(thumbPath);

            const origSize = fs.statSync(imgPath).size;
            const thumbSize = fs.statSync(thumbPath).size;
            const savings = ((1 - thumbSize / origSize) * 100).toFixed(0);
            
            thumbMap.set(imgPath, thumbPath);
            console.log(`  ✅ ${path.relative(DIST_DIR, imgPath)} → thumb (${savings}% smaller)`);
        } catch (err) {
            console.error(`  ❌ Failed to process ${imgPath}:`, err.message);
        }
    }

    // Replace image references in HTML files
    const htmlFiles = [];
    walk(DIST_DIR, (filePath) => {
        if (path.extname(filePath) === '.html') {
            htmlFiles.push(filePath);
        }
    });

    for (const htmlFile of htmlFiles) {
        let content = fs.readFileSync(htmlFile, 'utf8');
        let modified = false;

        for (const [origPath, thumbPath] of thumbMap) {
            const relOrig = path.relative(DIST_DIR, origPath).replace(/\\/g, '/');
            const relThumb = path.relative(DIST_DIR, thumbPath).replace(/\\/g, '/');
            
            // Only replace src= (not data-full= or other attributes)
            // Match src="path/to/image.jpg" but not data-full="..."
            // Using a regex that looks for src= followed by the image path
            const srcRegex = new RegExp(`src="([^"]*${relOrig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})"`, 'g');
            
            const newContent = content.replace(srcRegex, (match, capture) => {
                // Replace the captured image path with the thumb path
                return match.replace(relOrig, relThumb);
            });
            
            if (newContent !== content) {
                content = newContent;
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(htmlFile, content);
            console.log(`  📝 Updated ${path.relative(DIST_DIR, htmlFile)}`);
        }
    }

    console.log(`\n🎉 Done! Generated ${thumbMap.size} thumbnails, updated ${htmlFiles.length} HTML files.`);
}

processImages().catch((err) => {
    console.error('❌ Image optimization failed:', err);
    process.exit(1);
});
