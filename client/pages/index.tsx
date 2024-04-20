import DefaultLayout from "@/layouts/DefaultLayout";
import {
  Container,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";
import { usePublicGalleries } from "@/lib/swr";
import PublicGalleryList from "@/components/client/PublicGalleryList";
import { Language } from "@mui/icons-material";
import Logo from "@/components/client/Logo";

type Props = {};

const Home = (_props: Props) => {
  const galleriesRes = usePublicGalleries("galleries");

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
        <PublicGalleryList {...galleriesRes} />
      </Container>
    </div>
  );
};

Home.Layout = DefaultLayout;

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const enabled = process.env.HOMEPAGE_ENABLED;
  // Default to true if not set
  if (!enabled || enabled.toLowerCase() === "true") {
    return { props: {} };
  }

  return {
    notFound: true,
  };
};
