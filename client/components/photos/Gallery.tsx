import React from "react";
import {
  Alert,
  Container,
  FormControlLabel,
  Stack,
  Switch,
} from "@mui/material";
import { Photo as PhotoModel } from "@/lib/models";
import GalleryImages from "./GalleryImages";
import SortableGallery from "./SortableGallery";

type Props = {
  galleryID: string;
  images: PhotoModel[];
};

const Gallery = (props: Props) => {
  const [sortable, setSortable] = React.useState<boolean>(false);

  return (
    <React.Fragment>
      <Stack sx={{ mt: 4 }} direction="row" spacing={3}>
        <FormControlLabel
          control={
            <Switch
              checked={sortable}
              onChange={() => setSortable(!sortable)}
            />
          }
          label="Sortable"
        />
      </Stack>
      {!sortable && props.images.length > 0 && (
        <Alert
          data-aos="fade"
          data-aos-easing="ease-in-cubic"
          data-aos-anchor-placement="center-bottom"
          data-aos-delay={100}
          severity="info"
        >
          Right click an image for more options!
        </Alert>
      )}
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        {!sortable ? (
          <GalleryImages images={props.images} />
        ) : (
          <SortableGallery
            galleryID={Number(props.galleryID)}
            images={props.images}
          />
        )}
      </Container>
    </React.Fragment>
  );
};

export default Gallery;
