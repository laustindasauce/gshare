import {
  calcImageSize,
  getImageFullSrc,
  getImageSrc,
  shimmer,
  toBase64,
} from "@/helpers/photos";
import { Photo } from "@/lib/models";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImageListItem } from "@mui/material";
import Image from "next/image";
import React from "react";

type Props = {
  photo: Photo;
  index: number;
  cols: number;
};

const SortableImage = ({ photo, index, cols }: Props) => {
  const { ID, filename, width, height, blurDataURL } = photo;
  const sortable = useSortable({ id: ID });
  const { attributes, listeners, setNodeRef, transform, transition } = sortable;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: 0,
  };

  const quality = process.env.NEXT_PUBLIC_ADMIN_IMAGE_QUALITY
    ? Number(process.env.NEXT_PUBLIC_ADMIN_IMAGE_QUALITY)
    : 40;

  const getImageSize = (height: number, width: number) => {
    let size = calcImageSize(height, width, 100000, 900);
    if (cols === 2) {
      size = calcImageSize(height, width, 100000, 300);
    } else if (cols === 3) {
      size = calcImageSize(height, width, 100000, 450);
    } else if (cols === 4) {
      size = calcImageSize(height, width, 100000, 600);
    }

    return size;
  };

  const imageSize = getImageSize(height, width);

  const sortableProps = { index: index };
  return (
    <ImageListItem
      ref={setNodeRef}
      style={style}
      //   index={index}
      key={ID}
      {...sortableProps}
      {...attributes}
      {...listeners}
    >
      <Image
        className="link"
        src={getImageSrc(ID)}
        loading="lazy"
        placeholder={
          (blurDataURL as `data:image/${string}`) ||
          `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`
        }
        alt={filename}
        height={imageSize.height}
        width={imageSize.width}
        quality={quality}
        style={{
          objectFit: "contain",
          maxWidth: "100%",
          height: "auto",
        }}
      />
    </ImageListItem>
  );
};

export default SortableImage;
