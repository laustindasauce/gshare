import DefaultLayout from "@/layouts/DefaultLayout";
import {
  Container,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { GetStaticProps, GetStaticPropsContext } from "next";
import Head from "next/head";
import React from "react";
import PublicGalleryList from "@/components/client/PublicGalleryList";
import { Language } from "@mui/icons-material";
import Logo from "@/components/client/Logo";
import api from "@/lib/api";
import { GalleriesResponse, GalleryModel } from "@/lib/models";

type Props = {
  galleries?: GalleryModel[];
  isLoading: boolean;
  isError: boolean;
};

const Home = (props: Props) => {
  return (
    <div>
      <Head>
        <title>
          {process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME} - Public Galleries
        </title>
        <meta
          name="description"
          content={`Homepage for ${process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME}'s public galleries.`}
        />
        <link
          rel="shortcut icon"
          href={process.env.NEXT_PUBLIC_PHOTOGRAPHER_FAVICON || "/favicon.ico"}
        />
      </Head>
      {process.env.NEXT_PUBLIC_PHOTOGRAPHER_LOGO_DARK && (
        <Logo src={process.env.NEXT_PUBLIC_PHOTOGRAPHER_LOGO_DARK as string} />
      )}
      <Typography mt={3} variant="h5" textAlign="center">
        {process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME}
      </Typography>
      <Container sx={{ mb: 4 }} maxWidth="xs">
        <List dense>
          <ListItemButton
            target="_blank"
            href={process.env.NEXT_PUBLIC_PHOTOGRAPHER_WEBSITE || ""}
          >
            <ListItemIcon>
              <Language />
            </ListItemIcon>
            <ListItemText
              primary={process.env.NEXT_PUBLIC_PHOTOGRAPHER_WEBSITE?.replace(
                "https://",
                ""
              )}
            />
          </ListItemButton>
        </List>
      </Container>

      <Container maxWidth="lg">
        <PublicGalleryList {...props} />
      </Container>
    </div>
  );
};

Home.Layout = DefaultLayout;

export default Home;

export const getStaticProps: GetStaticProps = async (
  context: GetStaticPropsContext
) => {
  console.log("test");
  const enabled = process.env.NEXT_PUBLIC_HOMEPAGE_ENABLED;
  // Default to true if not set
  if (!enabled || enabled.toLowerCase() === "true") {
    try {
      const publicGalleriesRes: GalleriesResponse =
        await api.getPublicGalleries();

      return {
        props: {
          galleries: publicGalleriesRes.data,
          isLoading: false,
          isError: false,
        } as Props,
      };
    } catch (error) {
      console.error(error);

      return {
        props: {
          isLoading: false,
          isError: true,
        } as Props,
      };
    }
  }

  return {
    notFound: true,
  };
};
