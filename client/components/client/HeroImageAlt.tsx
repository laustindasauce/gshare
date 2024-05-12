import React from "react";
import Image from "next/image";
import styles from "@/styles/HeroAlt.module.css";
import { Photo } from "@/lib/models";
import { getImageSrc, shimmer, toBase64 } from "@/helpers/photos";
import { Box, Typography } from "@mui/material";

type Props = {
  img: Photo;
  padding: number;
  title: string;
  // children: JSX.Element;
};

const HeroImageAlt = (props: Props) => {
  const { img } = props;
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        // width: "100vw",
        height: `calc(50vh - ${props.padding || 0}px)`,
      }}
      className={styles.container}
    >
      <Image
        alt="main image"
        src={getImageSrc(img.ID)}
        placeholder={
          (img.blurDataURL as `data:image/${string}`) ||
          `data:image/svg+xml;base64,${toBase64(
            shimmer(img.width, img.height)
          )}`
        }
        fill
        style={{ objectFit: "cover" }}
        quality="100"
        priority
      />
      <Box className={styles.content}>
        <Typography className={styles.heroTitle} variant="h4">
          {props.title}
        </Typography>
        <Typography className={styles.subtitle} variant="body1">
          {process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME}
        </Typography>
      </Box>
      {process.env.NEXT_PUBLIC_PHOTOGRAPHER_LOGO_LIGHT && (
        <Box className={styles.logoContainer}>
          <img
            style={{
              // width: "100%",
              // maxWidth: "250px",
              maxHeight: "20vh",
              height: "100%",
            }}
            src={process.env.NEXT_PUBLIC_PHOTOGRAPHER_LOGO_LIGHT as string}
            alt={`${process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME} Logo`}
          />
        </Box>
      )}
    </div>
  );
};

export default HeroImageAlt;
