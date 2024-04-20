import { getImageSrc } from "@/helpers/photos";
import { Photo as PhotoModel } from "@/lib/models";
import React from "react";
import PhotoAlbum, { Photo } from "react-photo-album";
import useLightbox from "./useLightbox";
import NextAlbumImage from "./NextAlbumImage";

type Props = {
  galleryID: number;
  photos: PhotoModel[];
  loading: boolean;
};

function Gallery(props: Props) {
  const { setLightboxIndex, renderLightbox, setLightboxGalleryID } =
    useLightbox();

  setLightboxGalleryID(props.galleryID);

  const photos = props.photos.map((photo) => {
    return {
      src: getImageSrc(photo.ID),
      width: photo.width,
      height: photo.height,
      alt: `${photo.ID}`,
      key: photo.filename,
      blurDataURL: photo.blurDataURL,
      download: photo.filename,
    } as Photo;
  });

  return (
    <>
      <PhotoAlbum
        layout="rows"
        photos={photos}
        renderPhoto={(renderProps) => (
          <NextAlbumImage {...renderProps} galleryID={props.galleryID} />
        )}
        defaultContainerWidth={1200}
        onClick={({ index }) => setLightboxIndex(index)}
        sizes={{
          size: "calc(100vw / 2)",
          sizes: [{ viewport: "(max-width: 960px)", size: "100vw" }],
        }}
      />

      {renderLightbox({ slides: photos })}
    </>
  );
}

export default Gallery;
