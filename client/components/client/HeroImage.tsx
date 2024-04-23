import React from "react";
import Image from "next/image";
import styles from "@/styles/Hero.module.css";
import { Photo } from "@/lib/models";
import { getImageSrc, shimmer, toBase64 } from "@/helpers/photos";
import { Box, Button, Typography } from "@mui/material";
import Logo from "./Logo";

type Props = {
  img: Photo;
  padding: number;
  title: string;
  // children: JSX.Element;
};

const HeroImage = (props: Props) => {
  const { img } = props;
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        // width: "100vw",
        height: `calc(100vh - ${props.padding || 0}px)`,
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
        data-pin-no-hover="true"
        priority
      />
      <Box className={styles.content}>
        {process.env.NEXT_PUBLIC_PHOTOGRAPHER_LOGO_LIGHT && (
          /* eslint-disable @next/next/no-img-element */
          <img
            style={{ width: "100%", maxWidth: "250px" }}
            src={process.env.NEXT_PUBLIC_PHOTOGRAPHER_LOGO_LIGHT as string}
            alt={`${process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME} Logo`}
          />
        )}
        <Typography className={styles.heroTitle} variant="h3">
          {props.title}
        </Typography>
        <Button
          className={styles.heroButton}
          variant="outlined"
          href="#gallery-header"
        >
          view gallery
        </Button>
      </Box>
    </div>
  );
};

export default HeroImage;
