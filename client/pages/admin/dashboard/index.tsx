import GalleryList from "@/components/gallery/GalleryList";
import NewGalleryButton from "@/components/gallery/NewGalleryButton";
import Snacks from "@/components/global/Snacks";
import AdminLayout from "@/layouts/AdminLayout";
import { GalleryModel, SnacksModel } from "@/lib/models";
import { useAuthUser, useGalleries } from "@/lib/swr";
import {
  Container,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { getCookie } from "cookies-next";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import React from "react";

type Props = {
  token: string;
};

const GalleriesHandler = ({ token }: Props) => {
  const { user, isError, isLoading } = useAuthUser(token);

  const {
    galleries,
    isLoading: galleriesLoading,
    isError: galleriesError,
    mutateGalleries,
  } = useGalleries("galleries");

  const [snackbar, setSnackbar] = React.useState<SnacksModel>({
    open: false,
    severity: "success",
    locked: false,
    message: "",
  });

  if (isLoading || galleriesLoading) {
    return (
      <Container maxWidth="sm">
        <LinearProgress />
      </Container>
    );
  }

  if (galleriesError) {
    return (
      <Container>
        <Typography>Something went wrong..</Typography>
      </Container>
    );
  }

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCreated = (gallery: GalleryModel) => {
    setSnackbar({
      ...snackbar,
      severity: "success",
      message: `New gallery ${gallery.title} created.`,
      open: true,
    });
    mutateGalleries();
  };

  return (
    <Container maxWidth="lg">
      <Stack sx={{ mt: 2 }} direction="row" justifyContent="space-between">
        <Typography variant="h5" textAlign="center">
          galleries
        </Typography>
        <NewGalleryButton handleCreated={handleCreated} />
      </Stack>
      <Divider sx={{ mt: 1, mb: 2 }} />
      <GalleryList galleries={galleries} />
      <Snacks snackbar={snackbar} handleSnackbarClose={handleSnackbarClose} />
    </Container>
  );
};

GalleriesHandler.Layout = AdminLayout;

export default GalleriesHandler;

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const token = getCookie("admin-token", context);
  if (!token) {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }

  return { props: { token } };
};
