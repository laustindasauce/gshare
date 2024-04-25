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
import { getImageFullSrc, getImageSrc } from "@/helpers/photos";
import ImageContextMenu from "./ImageContextMenu";
import api from "@/lib/api";

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

  const quality = process.env.NEXT_PUBLIC_ADMIN_IMAGE_QUALITY || 40;

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
      <ImageList variant="masonry" cols={getCols()} gap={4}>
        {props.images.map((photo, index) => (
          <ImageListItem
            key={photo.ID}
            data-aos="fade"
            data-aos-easing="ease-in-cubic"
            data-aos-anchor-placement="top-bottom"
            data-aos-delay={100}
            data-aos-duration={500}
          >
            <img
              src={getImageFullSrc(photo.ID, "web", Number(quality))}
              srcSet={`${getImageFullSrc(photo.ID, 150, Number(quality))} 150w,
            ${getImageFullSrc(photo.ID, 300, Number(quality))} 300w,
            ${getImageFullSrc(photo.ID, 600, Number(quality))} 600w,
            ${getImageFullSrc(photo.ID, 900, Number(quality))} 900w,
            ${getImageFullSrc(photo.ID, 1200, Number(quality))} 1200w`}
              sizes="(max-width: 600px) 50vw,
            (max-width: 900px) 33vw,
            (max-width: 1536px) 25vw,
            20vw"
              alt={`${photo.filename}`}
              loading="lazy"
              onContextMenu={(e) => handleContextMenu(e, photo)}
            />
          </ImageListItem>
        ))}
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
