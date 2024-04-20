import React from "react";
import Image, { ImageProps } from "next/image";
import errorImg from "@/public/error-image-static.webp";

const HeaderImage = (props: ImageProps) => {
  const { src, alt, height, width, ...rest } = props;
  const [imgSrc, setImgSrc] = React.useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      onError={() => {
        setImgSrc(errorImg.src);
      }}
      {...rest}
    />
  );
};

export default HeaderImage;
