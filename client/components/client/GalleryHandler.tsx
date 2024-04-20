import React from "react";
import { Container } from "@mui/material";
import { Photo } from "@/lib/models";
import Gallery from "./Gallery";

type Props = {
  galleryID: number;
  photos: Photo[];
  loading: boolean;
};

const GalleryHandler = (props: Props) => {
  // const theme = useTheme();
  // const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  // const isSm = useMediaQuery(theme.breakpoints.only("sm"));
  // const isMd = useMediaQuery(theme.breakpoints.only("md"));
  // const isLg = useMediaQuery(theme.breakpoints.only("lg"));

  if (!props.photos) return null;

  return (
    <Container sx={{ mt: 2 }} maxWidth="xl">
      <Gallery {...props} />
    </Container>
  );
};

export default GalleryHandler;
