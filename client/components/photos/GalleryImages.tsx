import { GalleryUpdateModel, Photo as PhotoModel } from "@/lib/models";
import { Alert, Snackbar } from "@mui/material";
import Image from "next/image";
import React from "react";
import Confirmation from "./Confirmation";
import { getImageSrc, shimmer, toBase64 } from "@/helpers/photos";
import ImageContextMenu from "./ImageContextMenu";
import api from "@/lib/api";
import PhotoAlbum, { Photo, RenderPhotoProps } from "react-photo-album";

type Props = {
  images: PhotoModel[];
};

const GalleryImages = (props: Props) => {
  const [snackbar, setSnackbar] = React.useState<any>(null);
  const handleCloseSnackbar = () => setSnackbar(null);
  const [resources, setResources] = React.useState(
    props.images.map((photo) => {
      return {
        src: getImageSrc(photo.ID),
        width: photo.width,
        height: photo.height,
        alt: `${photo.ID}`,
        key: `${photo.gallery_id}`,
        blurDataURL: `data:image/svg+xml;base64,${toBase64(
          shimmer(photo.width, photo.height)
        )}`,
        download: photo.filename,
      } as Photo;
    })
  );

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] =
    React.useState(false);

  const [contextImage, setContextImage] = React.useState<Photo | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleContextMenu = (
    event: React.MouseEvent<HTMLDivElement>,
    image: Photo
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
      setResources(resources.filter((row) => row.alt !== contextImage.alt));
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
    setContextImage(null);
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
          featured_image_id: Number(contextImage.alt),
        };
        api
          .updateGallery(updateGallery, Number(contextImage.key))
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
        window.open(
          `${getImageSrc(Number(contextImage.alt))}/original/100`,
          "_blank"
        );
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
      <PhotoAlbum
        layout="rows"
        photos={resources}
        renderPhoto={({
          photo,
          imageProps: { alt, title, sizes, className, onClick },
          wrapperStyle,
        }: RenderPhotoProps) => {
          return (
            <div
              onContextMenu={(e) => handleContextMenu(e, photo)}
              style={{ ...wrapperStyle, position: "relative" }}
            >
              <Image
                fill
                src={photo}
                placeholder={`data:image/svg+xml;base64,${toBase64(
                  shimmer(photo.width, photo.height)
                )}`}
                quality="75"
                loading="lazy"
                {...{ alt, title, sizes, className, onClick }}
              />
            </div>
          );
        }}
        defaultContainerWidth={1200}
        sizes={{
          size: "calc(100vw / 2)",
          sizes: [{ viewport: "(max-width: 960px)", size: "100vw" }],
        }}
      />
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
