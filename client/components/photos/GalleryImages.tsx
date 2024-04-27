import { GalleryUpdateModel, Photo as PhotoModel } from "@/lib/models";
import {
  Alert,
  ImageList,
  ImageListItem,
  Snackbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import Confirmation from "./Confirmation";
import {
  calcImageSize,
  getImageFullSrc,
  getImageSrc,
  shimmer,
  toBase64,
} from "@/helpers/photos";
import ImageContextMenu from "./ImageContextMenu";
import api from "@/lib/api";
import Image from "next/image";

type Props = {
  images: PhotoModel[];
};

const GalleryImages = (props: Props) => {
  const [snackbar, setSnackbar] = React.useState<any>(null);
  const handleCloseSnackbar = () => setSnackbar(null);
  const [images, setImages] = React.useState(props.images);

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  const isSm = useMediaQuery(theme.breakpoints.only("sm"));
  const isMd = useMediaQuery(theme.breakpoints.only("md"));
  const isLg = useMediaQuery(theme.breakpoints.only("lg"));

  const quality = process.env.NEXT_PUBLIC_ADMIN_IMAGE_QUALITY
    ? Number(process.env.NEXT_PUBLIC_ADMIN_IMAGE_QUALITY)
    : 40;

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

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] =
    React.useState(false);

  const [contextImage, setContextImage] = React.useState<PhotoModel | null>(
    null
  );
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleContextMenu = (
    event: React.MouseEvent<HTMLDivElement>,
    image: PhotoModel
  ) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setContextImage(image);
  };

  const handleContextMenuClose = () => {
    setAnchorEl(null);
    setContextImage(null);
  };

  const handleDeleteConfirmationClose = (deleted: boolean, msg: string) => {
    if (!!deleted && !!contextImage) {
      setImages(images.filter((row) => row.ID !== contextImage.ID));
      setSnackbar({
        children: msg,
        severity: "success",
      });
    } else if (msg !== "") {
      setSnackbar({
        children: msg,
        severity: "warning",
      });
    }

    setDeleteConfirmationOpen(false);
    handleContextMenuClose();
  };

  const onMenuItemClick = async (action: string) => {
    if (!contextImage) {
      handleContextMenuClose();
      return;
    }
    switch (action) {
      case "delete":
        // Handle delete action
        setDeleteConfirmationOpen(true);
        break;
      case "setFeatured":
        // Handle setFeatured action
        const updateGallery: GalleryUpdateModel = {
          featured_image_id: contextImage.ID,
        };
        api
          .updateGallery(updateGallery, contextImage.gallery_id)
          .then(() =>
            setSnackbar({
              children: "Featured image updated!",
              severity: "success",
            })
          )
          .catch((err) => {
            console.error(err);
            setSnackbar({
              children: "Featured image couldn't be updated.",
              severity: "error",
            });
          })
          .finally(() => handleContextMenuClose());
        break;
      case "openImage":
        // Handle copyLink action
        // await navigator.clipboard.writeText(
        //   `${getImageSrc(Number(contextImage.alt))}/original/100`
        // );
        // setSnackbar({
        //   children: "Image url copied to clipboard.",
        //   severity: "success",
        // });
        window.open(`${getImageSrc(contextImage.ID)}/original/100`, "_blank");
        handleContextMenuClose();
        break;
      default:
        // Handle default case
        handleContextMenuClose();
        break;
    }
  };

  return (
    <React.Fragment>
      <ImageList variant="masonry" cols={getCols()} gap={7}>
        {props.images.map((photo, index) => {
          const imageSize = getImageSize(photo.height, photo.width);

          return (
            <ImageListItem
              style={{ marginBottom: 0 }}
              key={photo.ID}
              data-aos="fade"
              data-aos-easing="ease-in-cubic"
              data-aos-anchor-placement="top-bottom"
              data-aos-delay={100}
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
                onContextMenu={(e) => handleContextMenu(e, photo)}
              />
            </ImageListItem>
          );
        })}
      </ImageList>
      {!!contextImage && (
        <Confirmation
          open={deleteConfirmationOpen}
          handleClose={handleDeleteConfirmationClose}
          image={contextImage}
        />
      )}
      {!!snackbar && (
        <Snackbar
          open
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          onClose={handleCloseSnackbar}
          autoHideDuration={6000}
        >
          <Alert {...snackbar} onClose={handleCloseSnackbar} />
        </Snackbar>
      )}
      {/* Material-UI context menu */}
      <ImageContextMenu
        anchorEl={anchorEl}
        onClose={handleContextMenuClose}
        onMenuItemClick={onMenuItemClick}
      />
    </React.Fragment>
  );
};

export default GalleryImages;
