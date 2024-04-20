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
import { getImageSrc, shimmer, toBase64 } from "@/helpers/photos";
import HeaderImage from "../global/HeaderImage";
import Link from "next/link";
import SkeletonGalleries from "./SkeletonGalleries";

type Props = {
  galleries?: GalleryModel[];
  isLoading: boolean;
  isError: boolean;
};

const PublicGalleryList = ({ galleries, isLoading, isError }: Props) => {
  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.only("xs"));
  const isSM = useMediaQuery(theme.breakpoints.only("sm"));

  const getCols = () => {
    if (isXS) return 2;
    if (isSM) return 3;
    return 4;
  };

  if (isLoading) {
    return <SkeletonGalleries cols={getCols()} />;
  }

  if (isError || !galleries || galleries.length === 0) {
    return (
      <Typography textAlign="center">
        {process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME} has no public galleries.
      </Typography>
    );
  }

  return (
    <ImageList cols={getCols()} rowHeight={170}>
      {galleries.map((gallery) => {
        return (
          <Link key={gallery.ID} href={`/${gallery.path}`} passHref>
            <ImageListItem>
              <HeaderImage
                className="img-fluid"
                id={`img-${gallery.ID}`}
                alt={`img-${gallery.ID}`}
                src={`${getImageSrc(gallery.featured_image.ID)}/256/75`}
                fill
                placeholder={
                  (gallery.featured_image
                    .blurDataURL as `data:image/${string}`) ||
                  `data:image/svg+xml;base64,${toBase64(
                    shimmer(
                      gallery.featured_image.width,
                      gallery.featured_image.height
                    )
                  )}`
                }
                loading="lazy"
                style={{ objectFit: "cover" }}
              />
              <ImageListItemBar title={gallery.title} />
            </ImageListItem>
          </Link>
        );
      })}
    </ImageList>
  );
};

export default PublicGalleryList;
