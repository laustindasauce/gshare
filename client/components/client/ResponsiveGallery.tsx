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
import { getImageFullSrc } from "@/helpers/photos";
import { Download } from "@mui/icons-material";
import DownloadPrompt from "./DownloadPrompt";

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

  return (
    <ImageList variant="masonry" cols={getCols()} gap={4}>
      {photos.map((photo, index) => (
        <ImageListItem
          className={styles.container}
          key={photo.ID}
          data-aos="fade"
          data-aos-easing="ease-in-cubic"
          data-aos-anchor-placement="top-bottom"
          data-aos-delay={100}
          data-aos-duration={500}
        >
          <img
            src={getImageFullSrc(photo.ID, "web", quality)}
            srcSet={`${getImageFullSrc(photo.ID, 150, quality)} 150w,
            ${getImageFullSrc(photo.ID, 300, quality)} 300w,
            ${getImageFullSrc(photo.ID, 600, quality)} 600w,
            ${getImageFullSrc(photo.ID, 900, quality)} 900w,
            ${getImageFullSrc(photo.ID, 1200, quality)} 1200w`}
            sizes="(max-width: 600px) 50vw,
            (max-width: 900px) 33vw,
            (max-width: 1536px) 25vw,
            20vw"
            alt={`${photo.filename}`}
            loading="lazy"
            onClick={() => onClick(index)}
          />
          <div className={styles.overlay} onClick={() => onClick(index)}></div>
          <div className={styles.button}>
            <Stack
              sx={{ pr: 3 }}
              direction="row"
              justifyContent="end"
              spacing={1}
            >
              <IconButton onClick={() => downloadImage(photo)}>
                <Download sx={{ color: "white" }} />
              </IconButton>
            </Stack>
          </div>
        </ImageListItem>
      ))}
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
