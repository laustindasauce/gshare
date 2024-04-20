import { GalleryModel } from "@/lib/models";
import {
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import {
  calcImageSize,
  getImageSrc,
  shimmer,
  toBase64,
} from "@/helpers/photos";
import HeaderImage from "../global/HeaderImage";
import Link from "next/link";
import { getFormattedTableDate } from "@/helpers/format";
import { isGalleryLive } from "@/helpers/gallery";

type Props = {
  galleries?: GalleryModel[];
};

const GalleryList = ({ galleries }: Props) => {
  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.only("xs"));
  const isSM = useMediaQuery(theme.breakpoints.only("sm"));

  if (!galleries || galleries.length === 0) {
    return (
      <Typography textAlign="center">
        Once you have created galleries, they will show here...
      </Typography>
    );
  }

  const getCols = () => {
    if (isXS) return 2;
    if (isSM) return 3;
    return 4;
  };

  return (
    <ImageList cols={getCols()} rowHeight={170}>
      {galleries.map((gallery) => {
        const imageSize = calcImageSize(
          gallery.featured_image.height,
          gallery.featured_image.width,
          300,
          400
        );
        return (
          <Link
            key={gallery.ID}
            href={`/admin/dashboard/${gallery.ID}`}
            passHref
          >
            <ImageListItem>
              <HeaderImage
                className="img-fluid"
                id={`img-${gallery.ID}`}
                alt={`img-${gallery.ID}`}
                src={`${getImageSrc(gallery.featured_image.ID)}/256/75`}
                fill
                placeholder={`data:image/svg+xml;base64,${toBase64(
                  shimmer(imageSize.width, imageSize.height)
                )}`}
                loading="lazy"
                style={{ objectFit: "cover" }}
              />
              <ImageListItemBar
                title={gallery.title}
                subtitle={
                  gallery.event_date
                    ? `${getFormattedTableDate(gallery.event_date)} - ${
                        gallery.images_count
                      } images${isGalleryLive(gallery) ? " - live" : ""}`
                    : `${gallery.images_count} images${
                        isGalleryLive(gallery) ? " - live" : ""
                      }`
                }
              />
            </ImageListItem>
          </Link>
        );
      })}
    </ImageList>
  );
};

export default GalleryList;
