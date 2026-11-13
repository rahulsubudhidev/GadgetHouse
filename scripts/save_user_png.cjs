const sharp = require('sharp');

async function main() {
  const file1 = 'C:/Users/aDMIN/.gemini/antigravity/brain/7a481102-b08e-4ad4-a381-254f83808bfa/.user_uploaded/media_1794552411732_714be8fd.png';

  // Let's inspect the bounding box of non-transparent pixels in file1
  const trimmed = await sharp(file1).trim().toBuffer({ resolveWithObject: true });
  console.log('Trimmed user PNG size:', trimmed.info.width, 'x', trimmed.info.height);

  // Save the trimmed transparent PNG as public/logo.png and public/logo-transparent.png
  await sharp(file1)
    .trim()
    .png()
    .toFile('public/logo.png');

  await sharp(file1)
    .trim()
    .png()
    .toFile('public/logo-transparent.png');

  console.log('Successfully saved user transparent PNG as public/logo.png!');
}

main().catch(console.error);

