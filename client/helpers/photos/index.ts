// Helper method to get the height and width of images for next/image
export function calcImageSize(
  height: number,
  width: number,
  maxHeight: number,
  maxWidth: number
) {
  const heightDif = height / maxHeight;
  const widthDif = width / maxWidth;

  const maxDif = heightDif > widthDif ? heightDif : widthDif;

  return {
    height: Math.floor(height / maxDif),
    width: Math.floor(width / maxDif),
  };
}

// Helper method to get height and width for header image
export const calcHeaderImgSize = (
  height: number,
  width: number,
  maxWidth: number
) => {
  const dif = width / maxWidth;

  return {
    height: Math.floor(height / dif),
    width: maxWidth,
  };
};

// Helper method to get height and width for logo
export const calcLogoImgSize = (
  height: number,
  width: number,
  windowWidth: number,
  maxWidth: number
) => {
  const determinant = windowWidth < maxWidth ? windowWidth : maxWidth;
  const dif = width / determinant;

  return {
    height: Math.floor(height / dif),
    width: determinant,
  };
};

export const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

// Shimmer loading feature
export const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

export const getImageDownloadURL = (imageId: number, size: string) =>
  `${process.env.NEXT_PUBLIC_API_URL}/api/v1/download/${size}/image/${imageId}`;

export const getZipDownloadURL = (galleryId: number, size: string) =>
  `${process.env.NEXT_PUBLIC_API_URL}/api/v1/download/${size}/gallery/${galleryId}`;

export const getImageSrc = (ID: number) =>
  `${process.env.NEXT_PUBLIC_API_URL}/api/v1/images/${ID}`;

export const getImageFullSrc = (
  ID: number,
  width: number | string,
  quality: number
) =>
  `${process.env.NEXT_PUBLIC_API_URL}/api/v1/images/${ID}/${width}/${quality}`;

export const getImageBlurURL = (ID: number, width: number, quality: number) =>
  `${process.env.NEXT_PUBLIC_API_URL}/api/v1/images/${ID}/${width}/${quality}`;

export const normalize = (value: number, MIN: number, MAX: number) =>
  ((value - MIN) * 100) / (MAX - MIN);

export const getGalleryQRCodeURL = (galleryId: number) =>
  `${process.env.NEXT_PUBLIC_API_URL}/api/v1/galleries/id/${galleryId}/qr-code`;
