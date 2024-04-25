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
  if (!props.photos) return null;

  return (
    <Container sx={{ mt: 2 }} maxWidth="xl">
      <Gallery {...props} />
    </Container>
  );
};

export default GalleryHandler;
