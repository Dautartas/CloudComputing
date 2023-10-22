import sharp from 'sharp';

// Convert original image into standard size
// for this app
// in PNG format
export const generateThumbnailImage = async (image) => {
  if (!image) return null;

  const width = 200;
  const height = 200;

  return await sharp(image.buffer).resize(width, height).png().toBuffer();
};