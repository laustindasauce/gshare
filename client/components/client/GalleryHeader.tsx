import { Download } from "@mui/icons-material";
import { Button, Container, Stack, Typography, useTheme } from "@mui/material";
import { GalleryModel } from "@/lib/models";
import React from "react";
import DownloadPrompt from "./DownloadPrompt";
import { getFormattedTableDate } from "@/helpers/format";
import Grid from "@mui/material/Unstable_Grid2";

type Props = {
  gallery: GalleryModel;
};

const GalleryHeader = (props: Props) => {
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();

  const handleClose = () => setOpen(false);

  const downloadGallery = () => {
    setOpen(true);
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
              <Typography variant="subtitle1">
                {getFormattedTableDate(props.gallery.event_date)}
              </Typography>
            )}
            <Typography variant="subtitle2" {...titleProps}>
              {process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME}
            </Typography>
          </Stack>
        </Grid>
        <Grid xs={12} sm="auto">
          <Button
            {...buttonProps}
            variant="contained"
            onClick={downloadGallery}
            color="primary"
            startIcon={<Download />}
          >
            full gallery
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default GalleryHeader;
