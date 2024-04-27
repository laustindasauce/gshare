import styles from "@/styles/Gallery.module.css";
import {
  IconButton,
  ImageList,
  ImageListItem,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Photo as PhotoModel } from "@/lib/models";
import React from "react";
import {
  calcImageSize,
  getImageSrc,
  shimmer,
  toBase64,
} from "@/helpers/photos";
import { Download } from "@mui/icons-material";
import DownloadPrompt from "./DownloadPrompt";
import Image from "next/image";

type Props = {
  photos: PhotoModel[];
  onClick: (index: number) => void;
  galleryID: number;
  quality: number;
};

const ResponsiveGallery = ({ photos, galleryID, onClick, quality }: Props) => {
  const [open, setOpen] = React.useState(false);
  const [src, setSrc] = React.useState(0);
  const [fileName, setFileName] = React.useState("");
  const handleClose = () => setOpen(false);

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  const isSm = useMediaQuery(theme.breakpoints.only("sm"));
  const isMd = useMediaQuery(theme.breakpoints.only("md"));
  const isLg = useMediaQuery(theme.breakpoints.only("lg"));

  const downloadImage = async (photo: PhotoModel) => {
    setSrc(photo.ID);
    setFileName(photo.filename);
    setOpen(true);
  };

  const getCols = () => {
    let cols = 5;
    if (isXs) {
      cols = 2;
    } else if (isSm) {
      cols = 3;
    } else if (isMd) {
      cols = 4;
    } else if (isLg) {
      cols = 4;
    }

    return cols;
  };

  const getImageSize = (height: number, width: number) => {
    let size = calcImageSize(height, width, 100000, 900);
    if (isXs) {
      size = calcImageSize(height, width, 100000, 300);
    } else if (isSm) {
      size = calcImageSize(height, width, 100000, 450);
    } else if (isMd) {
      size = calcImageSize(height, width, 100000, 600);
    }

    return size;
  };

  return (
    <ImageList variant="masonry" cols={getCols()} gap={7}>
      {photos.map((photo, index) => {
        const imageSize = getImageSize(photo.height, photo.width);

        return (
          <ImageListItem
            className={styles.container}
            key={photo.ID}
            data-aos="fade"
            data-aos-easing="ease-in-cubic"
            data-aos-anchor-placement="top-bottom"
            data-aos-delay={50}
            data-aos-duration={500}
          >
            <Image
              src={getImageSrc(photo.ID)}
              loading="lazy"
              placeholder={
                (photo.blurDataURL as `data:image/${string}`) ||
                `data:image/svg+xml;base64,${toBase64(
                  shimmer(photo.width, photo.height)
                )}`
              }
              alt={photo.filename}
              height={imageSize.height}
              width={imageSize.width}
              quality={quality}
              style={{
                objectFit: "contain",
                maxWidth: "100%",
                height: "auto",
              }}
            />
            <div
              className={styles.overlay}
              onClick={() => onClick(index)}
            ></div>
            <div className={styles.button}>
              <Stack
                sx={{ pr: 3 }}
                direction="row"
                justifyContent="end"
                spacing={1}
              >
                <IconButton onClick={() => downloadImage(photo)}>
                  <Download color="info" />
                </IconButton>
              </Stack>
            </div>
          </ImageListItem>
        );
      })}
      {src !== 0 && open && (
        <DownloadPrompt
          galleryID={galleryID}
          imageID={src}
          open={open}
          fileName={fileName}
          handleClose={handleClose}
        />
      )}
    </ImageList>
  );
};

export default ResponsiveGallery;
