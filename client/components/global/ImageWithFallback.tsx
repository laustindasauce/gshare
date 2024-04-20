import React from "react";
import Image, { ImageProps } from "next/image";
import errorImg from "@/public/error-image-static.webp";

const ImageWithFallback = (props: ImageProps) => {
  const { src, alt, height, width, ...rest } = props;
  const [imgSrc, setImgSrc] = React.useState(src);
  const [imgSize, setImgSize] = React.useState({ height, width });

  return (
    <Image
      src={imgSrc}
      alt={alt}
      height={!!props.fill ? undefined : imgSize.height}
      width={!!props.fill ? undefined : imgSize.width}
      onError={() => {
        setImgSrc(errorImg);
        setImgSize({ height: errorImg.height, width: errorImg.width });
      }}
      {...rest}
    />
  );
};

export default ImageWithFallback;
