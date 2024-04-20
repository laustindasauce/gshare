import { ImageList, ImageListItem, Skeleton } from "@mui/material";
import React from "react";

type Props = {
  cols: number;
};

const SkeletonGalleries = ({ cols }: Props) => {
  return (
    <ImageList cols={cols} rowHeight={170}>
      {Array.from({ length: cols }, (_, index) => (
        <ImageListItem key={index}>
          <Skeleton variant="rectangular" width={256} height={170} />
        </ImageListItem>
      ))}
    </ImageList>
  );
};

export default SkeletonGalleries;
