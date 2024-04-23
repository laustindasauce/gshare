import EventsTable from "@/components/gallery/EventsTable";
import GallerySettings from "@/components/gallery/GallerySettings";
import GalleryShareButton from "@/components/gallery/GalleryShareButton";
import ZipGalleryButton from "@/components/gallery/ZipGalleryButton";
import Snacks from "@/components/global/Snacks";
import FeaturedImage from "@/components/photos/FeaturedImage";
import Gallery from "@/components/photos/Gallery";
import Upload from "@/components/photos/Upload";
import { isGalleryLive } from "@/helpers/gallery";
import AdminLayout from "@/layouts/AdminLayout";
import api from "@/lib/api";
import { GalleryUpdateModel, SnacksModel } from "@/lib/models";
import { useAuthUser, useGallery } from "@/lib/swr";
import { ExitToApp, UploadFile } from "@mui/icons-material";
import { TabContext, TabPanel } from "@mui/lab";
import {
  Alert,
  Box,
  Button,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { getCookie } from "cookies-next";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import React from "react";

export interface QParams extends ParsedUrlQuery {
  id?: string;
}

type Props = {
  galleryID: string;
  token: string;
};

const GalleryHandler = ({ galleryID, token }: Props) => {
  const { user, isLoading } = useAuthUser(token);
  const {
    gallery,
    isLoading: galleryLoading,
    isError,
    mutateGallery,
  } = useGallery(galleryID);

  const [uploadOpen, setUploadOpen] = React.useState(false);

  const [updateLoading, setUpdateLoading] = React.useState(false);

  const [snackbar, setSnackbar] = React.useState<SnacksModel>({
    open: false,
    severity: "success",
    locked: false,
    message: "",
  });

  const [value, setValue] = React.useState("one");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  if (isLoading || galleryLoading) {
    return (
      <Container sx={{ mt: 4 }} maxWidth="sm">
        <LinearProgress />
      </Container>
    );
  }

  if (isError || !gallery) {
    return (
      <Container maxWidth="lg">
        <Typography>Something went wrong..</Typography>
      </Container>
    );
  }

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleUploadComplete = (successCount: number, errorCount: number) => {
    setSnackbar({
      ...snackbar,
      // set to success with no errors, fail with no success and warn if mixed
      severity:
        errorCount === 0 ? "success" : successCount === 0 ? "error" : "warning",
      message:
        successCount > 0
          ? `${successCount} images were uploaded successfully. Refresh to see the new images.`
          : successCount === 0
          ? `${successCount} images were uploaded and ${errorCount} failed. Refresh to see the new images.`
          : `${errorCount} failed to upload.`,
      open: true,
    });
    mutateGallery();
  };

  const handleRemoveFeaturedImage = () => {
    const updateGallery: GalleryUpdateModel = {
      featured_image_id: 0,
    };
    api
      .updateGallery(updateGallery, gallery.ID)
      .then((res) => {
        setSnackbar({
          ...snackbar,
          severity: "success",
          message: "Gallery feature image removed.",
          open: true,
        });
        mutateGallery(res);
      })
      .catch((err) => {
        console.error(err);
        setSnackbar({
          ...snackbar,
          severity: "error",
          message: "Unable to update gallery.",
          open: true,
        });
      });
  };

  const handleUpdate = (formData: GalleryUpdateModel) => {
    setUpdateLoading(true);

    if (
      (!gallery.protected && formData.protected && !formData.password) ||
      formData.password === ""
    ) {
      setSnackbar({
        ...snackbar,
        severity: "error",
        message: "You must have a password for the gallery to be protected.",
        open: true,
      });
      setUpdateLoading(false);
      return;
    }

    if (
      (!gallery.reminder_emails &&
        formData.reminder &&
        !formData.reminder_emails) ||
      formData.reminder_emails === ""
    ) {
      setSnackbar({
        ...snackbar,
        severity: "error",
        message:
          "You must have at least one email for the reminder to be enabled!",
        open: true,
      });
      setUpdateLoading(false);
      return;
    }

    api
      .updateGallery(formData, gallery.ID)
      .then((res) => {
        setSnackbar({
          ...snackbar,
          severity: "success",
          message: "Gallery updated.",
          open: true,
        });
        mutateGallery(res);
      })
      .catch((err) => {
        console.error(err);
        setSnackbar({
          ...snackbar,
          severity: "error",
          message: "Unable to update gallery.",
          open: true,
        });
      })
      .finally(() => setUpdateLoading(false));
  };

  const galleryLive = isGalleryLive(gallery);

  return (
    <Container sx={{ mt: 2 }}>
      {galleryLive && gallery.featured_image.ID === 0 && (
        <Alert sx={{ mb: 2 }} severity="warning">
          No featured image set! A random image will be used if you do not set
          one. Right click an image in the gallery to set it as the featured
          image.
        </Alert>
      )}
      <Stack sx={{ mb: 2 }} spacing={1} direction="row">
        <Typography variant="h4">{gallery.title}</Typography>

        {galleryLive ? (
          <Button
            color="primary"
            startIcon={<ExitToApp />}
            onClick={() =>
              window.open(window.location.origin + "/" + gallery.path, "_blank")
            }
          >
            live
          </Button>
        ) : (
          <Button
            color="info"
            startIcon={<ExitToApp />}
            onClick={() =>
              window.open(
                window.location.origin + "/admin/preview/" + gallery.ID,
                "_blank"
              )
            }
          >
            Preview
          </Button>
        )}

        {galleryLive && (
          <GalleryShareButton gallery={gallery} setSnackBar={setSnackbar} />
        )}
      </Stack>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="secondary"
            indicatorColor="secondary"
            aria-label="secondary tabs example"
          >
            <Tab value="one" label="Gallery" />
            <Tab value="two" label="Settings" />
            <Tab value="three" label="Events" />
          </Tabs>
        </Box>
        <TabPanel value="one">
          {gallery.featured_image.ID !== 0 && (
            <>
              <FeaturedImage
                photo={gallery.featured_image}
                maxHeight={500}
                maxWidth={500}
              />
              <Stack sx={{ mb: 4 }} direction="row" justifyContent="center">
                <Button onClick={handleRemoveFeaturedImage} color="error">
                  remove featured image
                </Button>
              </Stack>
            </>
          )}

          <Grid container spacing={2}>
            <Grid xs="auto">
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setUploadOpen(!uploadOpen)}
                startIcon={<UploadFile />}
              >
                Upload Images
              </Button>
            </Grid>
            <Grid xs="auto">
              <ZipGalleryButton setSnackBar={setSnackbar} gallery={gallery} />
            </Grid>
          </Grid>
          <Upload
            open={uploadOpen}
            handleClose={() => setUploadOpen(false)}
            galleryID={galleryID}
            handleUploadComplete={handleUploadComplete}
          />

          <Gallery galleryID={galleryID} images={gallery.images} />
        </TabPanel>

        <TabPanel value="two">
          <Container sx={{ mt: 2 }} maxWidth="md">
            <Paper sx={{ p: 3 }} elevation={3}>
              <GallerySettings
                loading={updateLoading}
                gallery={gallery}
                onUpdate={handleUpdate}
              />
            </Paper>
          </Container>
        </TabPanel>
        <TabPanel value="three">
          <EventsTable events={gallery.events} setSnackBar={setSnackbar} />
        </TabPanel>
      </TabContext>

      <Snacks snackbar={snackbar} handleSnackbarClose={handleSnackbarClose} />
    </Container>
  );
};

GalleryHandler.Layout = AdminLayout;

export default GalleryHandler;

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { id } = context.params as QParams;
  const token = getCookie("admin-token", context);
  if (!token) {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }
  return { props: { galleryID: id, token } };
};
