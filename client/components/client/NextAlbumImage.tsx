import styles from "@/styles/Gallery.module.css";
import { Download } from "@mui/icons-material";
import { IconButton, Stack } from "@mui/material";
import Image from "next/image";
import React from "react";
import { Photo, RenderPhotoProps } from "react-photo-album";
import DownloadPrompt from "./DownloadPrompt";

type Props = RenderPhotoProps & {
  galleryID: number;
};

const NextAlbumImage = (props: Props) => {
  const {
    photo,
    imageProps: { alt, title, sizes, className, onClick },
    wrapperStyle,
    galleryID,
  } = props;

  const [open, setOpen] = React.useState(false);
  const [src, setSrc] = React.useState(0);
  const [fileName, setFileName] = React.useState("");
  const handleClose = () => setOpen(false);

  const downloadImage = async (photo: Photo) => {
    setSrc(Number(photo.alt));
    setFileName(photo.key as string);
    setOpen(true);
  };

  return (
    <React.Fragment>
      <div
        className={styles.container}
        style={{ ...wrapperStyle, position: "relative" }}
        data-aos="fade"
        data-aos-easing="ease-in-cubic"
        data-aos-anchor-placement="top-bottom"
        data-aos-delay={100}
        data-aos-duration={500}
      >
        <Image
          fill
          src={photo}
          placeholder="blur"
          quality="100"
          loading="lazy"
          {...{ alt, title, sizes, className, onClick }}
        />
        <div className={styles.overlay} onClick={onClick}></div>
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
      </div>

      {src !== 0 && open && (
        <DownloadPrompt
          galleryID={galleryID}
          imageID={src}
          open={open}
          fileName={fileName}
          handleClose={handleClose}
        />
      )}
    </React.Fragment>
  );
};

export default NextAlbumImage;
