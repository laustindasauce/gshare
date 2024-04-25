import { getImageSrc } from "@/helpers/photos";
import { Photo as PhotoModel } from "@/lib/models";
import React from "react";
import useLightbox from "./lightbox/useLightbox";
import ResponsiveGallery from "./ResponsiveGallery";

type Props = {
  galleryID: number;
  photos: PhotoModel[];
  loading: boolean;
};

function Gallery(props: Props) {
  const { setLightboxIndex, renderLightbox, setLightboxGalleryID } =
    useLightbox();

  setLightboxGalleryID(props.galleryID);

  // Lightbox slides expects slightly different format
  const photos = props.photos.map((photo) => {
    return {
      src: getImageSrc(photo.ID),
      width: photo.width,
      height: photo.height,
      alt: `${photo.ID}`,
      key: photo.filename,
      blurDataURL: photo.blurDataURL,
      download: photo.filename,
    };
  });

  return (
    <>
      <ResponsiveGallery
        photos={props.photos}
        galleryID={props.galleryID}
        onClick={(index: number) => setLightboxIndex(index)}
        quality={100}
      />

      {renderLightbox({ slides: photos })}
    </>
  );
}

export default Gallery;
