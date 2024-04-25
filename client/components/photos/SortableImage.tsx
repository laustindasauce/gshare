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
};

const SortableImage = ({ photo, index }: Props) => {
  const { ID, filename } = photo;
  const sortable = useSortable({ id: ID });
  const { attributes, listeners, setNodeRef, transform, transition } = sortable;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const quality = process.env.NEXT_PUBLIC_ADMIN_IMAGE_QUALITY || 40;

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
      <img
        className="img-link"
        src={getImageFullSrc(ID, "web", Number(quality))}
        srcSet={`${getImageFullSrc(ID, 150, Number(quality))} 150w,
            ${getImageFullSrc(ID, 300, Number(quality))} 300w,
            ${getImageFullSrc(ID, 600, Number(quality))} 600w,
            ${getImageFullSrc(ID, 900, Number(quality))} 900w,
            ${getImageFullSrc(ID, 1200, Number(quality))} 1200w`}
        sizes="(max-width: 600px) 50vw,
            (max-width: 900px) 33vw,
            (max-width: 1536px) 25vw,
            20vw"
        alt={`${filename}`}
        loading="lazy"
      />
    </ImageListItem>
  );
};

export default SortableImage;
