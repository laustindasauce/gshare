import HeroImage from "@/components/client/HeroImage";
import GalleryHandler from "@/components/client/GalleryHandler";
import {
  Alert,
  Backdrop,
  Checkbox,
  Container,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { GalleryModel } from "@/lib/models";
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from "next";
import Head from "next/head";
import React from "react";
import GalleryHeader from "@/components/client/GalleryHeader";
import { ParsedUrlQuery } from "querystring";
import api from "@/lib/api";
import { LoadingButton } from "@mui/lab";
import { randomFeaturedImage } from "@/helpers/gallery";
import DefaultLayout from "@/layouts/DefaultLayout";
import { getImageBlurURL } from "@/helpers/photos";
import axios from "axios";
import { useRouter } from "next/router";

interface IParams extends ParsedUrlQuery {
  path: string;
}

type Props = {
  gallery: GalleryModel;
  locked: boolean;
};

const ClientGalleryHandler = (props: Props) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [locked, setLocked] = React.useState(props.locked);
  const router = useRouter();
  const { p } = router.query;

  React.useEffect(() => {
    if (typeof p === "string") {
      setLoading(true);
      api
        .unlockGallery(props.gallery.path, p)
        .then(() => {
          setLocked(false);
          setError(false);
        })
        .catch((err) => {
          console.error(err);
          setError(true);
        })
        .finally(() => setLoading(false));
    }
  }, [p, props.gallery.path]);

  const checkPassword = (pass: string) => {
    setLoading(true);

    api
      .unlockGallery(props.gallery.path, pass)
      .then(() => {
        setLocked(false);
        setError(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      // Trigger login action when Enter key is pressed
      checkPassword(password);
    }
  };

  if (locked) {
    return (
      <div>
        <Head>
          <title>
            {props.gallery.title} | {process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME}
          </title>
          <meta
            name="description"
            content={`{process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME}'s gallery for ${props.gallery.title}.`}
          />
          <link
            rel="shortcut icon"
            href={
              process.env.NEXT_PUBLIC_PHOTOGRAPHER_FAVICON || "/favicon.ico"
            }
          />
        </Head>
        <Backdrop
          sx={{
            color: "#fff",
            // zIndex: (theme) => theme.zIndex.drawer + 1,
            // backdropFilter: "blur(10px)",
          }}
          open={locked}
        >
          <Container maxWidth="sm">
            <Paper sx={{ p: 4, width: "100%" }}>
              <Typography mb={3} variant="body1">
                This gallery is private. Please enter the password to access the
                photos.
              </Typography>
              {error && (
                <Alert
                  sx={{ mb: 2 }}
                  severity="error"
                  onClose={() => setError(false)}
                >
                  Password is incorrect.
                </Alert>
              )}
              <TextField
                variant="outlined"
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Stack
                sx={{ mt: 2 }}
                direction="row"
                justifyContent="space-between"
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showPassword}
                      onChange={() =>
                        setShowPassword((prevValue) => !prevValue)
                      }
                    />
                  }
                  label="Show Password"
                />
                <LoadingButton
                  variant="contained"
                  loading={loading}
                  onClick={() => checkPassword(password)}
                >
                  Unlock Gallery
                </LoadingButton>
              </Stack>
            </Paper>
          </Container>
        </Backdrop>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>
          {props.gallery.title} | {process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME}
        </title>
        <meta
          name="description"
          content={`${process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME}'s gallery for ${props.gallery.title}.`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {props.gallery.hero_enabled && (
        <HeroImage
          img={props.gallery.featured_image}
          title={props.gallery.title}
          padding={0}
        />
      )}
      <Container maxWidth={false} id="gallery-header">
        <GalleryHeader gallery={props.gallery} />
        <GalleryHandler
          galleryID={props.gallery.ID}
          photos={props.gallery.images}
          loading={false}
        />
      </Container>
    </div>
  );
};

ClientGalleryHandler.Layout = DefaultLayout;

export default ClientGalleryHandler;

export const getStaticProps: GetStaticProps = async (
  context: GetStaticPropsContext
) => {
  const { path } = context.params as IParams;

  if (typeof path == "string") {
    if (path === "admin") {
      return {
        redirect: {
          destination: "/admin/dashboard",
          permanent: true,
        },
      };
    }

    try {
      const res = await api.getGallery(path);
      let locked = res.data.protected;

      res.data.featured_image =
        res.data.featured_image.ID === 0
          ? randomFeaturedImage(res.data.images)
          : res.data.featured_image;

      try {
        const response = await axios.get(
          getImageBlurURL(res.data.featured_image.ID, 64, 30),
          {
            responseType: "arraybuffer", // Ensure response is treated as binary data
          }
        );

        if (!response || !response.data) {
          throw new Error("Empty or invalid image data received");
        }

        // Convert the binary image data to base64
        const base64Image = Buffer.from(response.data, "binary").toString(
          "base64"
        );

        // Set base64 string as placeholder
        res.data.featured_image = {
          ...res.data.featured_image,
          blurDataURL: `data:image/jpeg;base64,${base64Image}`,
        };
      } catch (error) {
        console.error("Error fetching image:", error);
      }

      for (let i = 0; i < res.data.images.length; i++) {
        try {
          const response = await axios.get(
            getImageBlurURL(res.data.images[i].ID, 64, 30),
            {
              responseType: "arraybuffer", // Ensure response is treated as binary data
            }
          );

          if (!response || !response.data) {
            throw new Error("Empty or invalid image data received");
          }

          // Convert the binary image data to base64
          const base64Image = Buffer.from(response.data, "binary").toString(
            "base64"
          );

          // Set base64 string as placeholder
          res.data.images[i] = {
            ...res.data.images[i],
            blurDataURL: `data:image/jpeg;base64,${base64Image}`,
          };
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }

      return {
        props: { gallery: res.data, locked },
      };
    } catch (error) {
      console.warn("Gallery not found");
      console.error(error);
    }
  }

  return {
    notFound: true,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const res = await api.getLiveGalleries();

  const galleries: GalleryModel[] = res.data;

  let paths = galleries.map((gallery: GalleryModel) => ({
    params: { path: gallery.path },
  }));

  return {
    paths,
    fallback: false, // can also be true or 'blocking'
  };
};
