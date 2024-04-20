import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";
import Image from "next/image";
import React from "react";

type Props = {
  info: string | null;
};

const LoadingBackdrop = (props: Props) => {
  return (
    <>
      {props.info && <Typography textAlign="center">{props.info}</Typography>}
      <Box sx={{ display: "flex", justifyContent: "center", m: 5 }}>
        <CircularProgress />
      </Box>
    </>
  );
};

export default LoadingBackdrop;
