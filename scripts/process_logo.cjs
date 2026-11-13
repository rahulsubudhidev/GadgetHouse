const sharp = require('sharp');
const fs = require('fs');

async function main() {
  const file1 = 'C:/Users/aDMIN/.gemini/antigravity/brain/7a481102-b08e-4ad4-a381-254f83808bfa/.user_uploaded/media_1794552411732_714be8fd.png';
  const file2 = 'C:/Users/aDMIN/.gemini/antigravity/brain/7a481102-b08e-4ad4-a381-254f83808bfa/.user_uploaded/media_1794552411761_46361715.png';

  const { data: d1 } = await sharp(file1).raw().toBuffer({ resolveWithObject: true });
  let visible1 = 0;
  for (let i = 0; i < d1.length; i += 4) {
    if (d1[i+3] > 20) visible1++;
  }
  console.log('File 1 (714be8fd) visible pixels:', visible1);

  // In file2 (46361715), remove background color RGB(24, 29, 38)
  // Let's create a perfectly transparent logo PNG from file2!
  const { data: d2, info: info2 } = await sharp(file2).raw().toBuffer({ resolveWithObject: true });
  const outBuf = Buffer.alloc(d2.length);

  for (let i = 0; i < d2.length; i += 4) {
    const r = d2[i];
    const g = d2[i+1];
    const b = d2[i+2];
    
    // Background is around (24, 29, 38)
    const distToBg = Math.sqrt((r - 24)**2 + (g - 29)**2 + (b - 38)**2);
    if (distToBg < 35) {
      // transparent
      outBuf[i] = 0;
      outBuf[i+1] = 0;
      outBuf[i+2] = 0;
      outBuf[i+3] = 0;
    } else {
      outBuf[i] = r;
      outBuf[i+1] = g;
      outBuf[i+2] = b;
      outBuf[i+3] = 255;
    }
  }

  // Save as public/logo-transparent.png
  await sharp(outBuf, { raw: { width: info2.width, height: info2.height, channels: 4 } })
    .png()
    .toFile('public/logo-transparent.png');

  // Also replace public/logo.png with the transparent version!
  await sharp(outBuf, { raw: { width: info2.width, height: info2.height, channels: 4 } })
    .png()
    .toFile('public/logo.png');

  // Also create a trimmed version for ultra-crisp display
  await sharp('public/logo-transparent.png')
    .trim()
    .toFile('public/logo-trimmed.png');

  console.log('Successfully generated transparent logo PNGs in public/!');
}

main().catch(console.error);

