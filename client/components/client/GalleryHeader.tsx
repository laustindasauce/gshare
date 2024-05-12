import { Container, IconButton, Stack, Typography } from "@mui/material";
import { GalleryModel, SnacksModel } from "@/lib/models";
import React from "react";
import DownloadPrompt from "./DownloadPrompt";
import { getFormattedTableDate } from "@/helpers/format";
import Grid from "@mui/material/Unstable_Grid2";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import ShareIcon from "@mui/icons-material/Share";
import Snacks from "../global/Snacks";

type Props = {
  gallery: GalleryModel;
};

const GalleryHeader = (props: Props) => {
  const [open, setOpen] = React.useState(false);

  const [snackbar, setSnackbar] = React.useState<SnacksModel>({
    open: false,
    severity: "success",
    locked: false,
    message: "",
    autoHideDuration: 4000,
  });

  const handleClose = () => setOpen(false);

  const downloadGallery = () => {
    setOpen(true);
  };

  const copyGalleryPath = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setSnackbar({
      ...snackbar,
      open: true,
      message: "Gallery link copied to clipboard!",
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Need to set the aos props only if hero is enabled due
  // to an issue with them not showing when hero is disabled
  const titleProps = props.gallery.hero_enabled
    ? {
        "data-aos": "fade-right",
        "data-aos-easing": "ease-in-cubic",
        "data-aos-anchor-placement": "top-bottom",
        "data-aos-delay": 100,
      }
    : {};

  const buttonProps = props.gallery.hero_enabled
    ? {
        "data-aos": "fade-left",
        "data-aos-easing": "ease-in-cubic",
        "data-aos-anchor-placement": "top-bottom",
        "data-aos-delay": 100,
      }
    : {};

  return (
    <Container maxWidth="xl">
      <DownloadPrompt
        galleryID={props.gallery.ID}
        imageID={null}
        zip={true}
        open={open}
        fileName="gallery.zip"
        handleClose={handleClose}
      />

      <Grid
        container
        spacing={3}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 1 }}
      >
        <Grid xs={12} sm={6}>
          <Stack>
            <Typography variant="h5" {...titleProps}>
              {props.gallery.title}
            </Typography>
            {props.gallery.event_date && (
              <Typography variant="subtitle1" {...titleProps}>
                {getFormattedTableDate(props.gallery.event_date)}
              </Typography>
            )}
            <Typography variant="subtitle2" {...titleProps}>
              {process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME}
            </Typography>
            <Typography variant="caption" {...titleProps}>
              {props.gallery.images.length} Images
            </Typography>
          </Stack>
        </Grid>
        <Grid xs={12} sm="auto">
          <Stack direction="row" spacing={2}>
            <IconButton {...buttonProps} onClick={copyGalleryPath}>
              <ShareIcon />
            </IconButton>
            <IconButton {...buttonProps} onClick={downloadGallery}>
              <CloudDownloadIcon color="primary" />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
      <Snacks snackbar={snackbar} handleSnackbarClose={handleSnackbarClose} />
    </Container>
  );
};

export default GalleryHeader;
