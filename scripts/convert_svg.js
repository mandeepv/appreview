const fs = require('fs');
const { Resvg } = require('@resvg/resvg-js');

console.log('Converting logo.svg to PNG files...\n');

// Read the SVG file
const svg = fs.readFileSync('./logo.svg');

// Function to render PNG at specific size
function renderPNG(width, height, outputPath) {
  const opts = {
    fitTo: {
      mode: 'width',
      value: width,
    },
  };

  const resvg = new Resvg(svg, opts);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`✓ Created ${outputPath} (${width}x${height})`);
}

// Generate icon.png (1024x1024)
renderPNG(1024, 1024, './assets/icon.png');

// Generate adaptive-icon.png (1024x1024)
renderPNG(1024, 1024, './assets/adaptive-icon.png');

// Generate splash.png (2048x2048)
renderPNG(2048, 2048, './assets/splash.png');

console.log('\n✅ All PNG files created successfully!');
console.log('The logo is now set with Soft Sage Teal color (#4F8F8B)');
