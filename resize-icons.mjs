import sharp from 'sharp';

const input = 'client/public/image/image.png';

async function generateIcons() {
  try {
    await sharp(input)
      .resize(192, 192)
      .toFile('client/public/icon-192.png');
      
    await sharp(input)
      .resize(512, 512)
      .toFile('client/public/icon-512.png');
      
    console.log('Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
