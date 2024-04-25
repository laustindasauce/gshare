import {
  calcImageSize,
  getImageSrc,
  shimmer,
  toBase64,
} from "@/helpers/photos";
import { Photo } from "@/lib/models";
import Grid from "@mui/material/Unstable_Grid2";
import React from "react";
import ImageWithFallback from "../global/ImageWithFallback";

type Props = {
  photo: Photo;
  maxHeight: number;
  maxWidth: number;
};

const FeaturedImage = ({ photo, maxHeight, maxWidth }: Props) => {
  const { ID, gallery_id, height, width, position, CreatedAt } = photo;
  const imageSize = calcImageSize(height, width, maxHeight, maxWidth);
  return (
    <Grid sx={{ m: 3 }} container justifyContent="center">
      <Grid xs="auto">
        <ImageWithFallback
          className="img-fluid"
          id={`img-${ID}`}
          alt={`img-${ID}`}
          src={getImageSrc(ID)}
          quality={Number(process.env.NEXT_PUBLIC_ADMIN_IMAGE_QUALITY || 40)}
          height={imageSize.height || 200}
          width={imageSize.width || 300}
          placeholder={`data:image/svg+xml;base64,${toBase64(
            shimmer(imageSize.width, imageSize.height)
          )}`}
          loading="eager"
        />
      </Grid>
    </Grid>
  );
};

export default FeaturedImage;
