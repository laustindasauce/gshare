import { ImageLoaderProps } from "next/image";

const imageLoader = ({ src, width, quality }: ImageLoaderProps) => {
  if (
    src.startsWith("/") ||
    src.startsWith("data") ||
    (src.match(/\//g) || []).length > 6
  ) {
    return src;
  }

  // Define the environment variable, defaulting to 256 if not set
  let MIN_WIDTH: number = 256;

  try {
    // Attempt to parse environment variable as number with default
    MIN_WIDTH = parseInt(process.env.NEXT_PUBLIC_IMAGE_MIN_WIDTH || "256", 10);
  } catch (error) {
    // Handle the error if parsing fails
    console.error("Error parsing environment variable:", error);
    // You might want to set a default value here as a fallback
    console.log("Using default value:", MIN_WIDTH);
  }

  let imgWidth = width;

  if (width < MIN_WIDTH) {
    imgWidth = MIN_WIDTH;
  }

  // Add /width/height to the image source
  const resizedSrc = `${src}/${imgWidth}/${quality || 75}`;

  return resizedSrc;
};

export default imageLoader;
