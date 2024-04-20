import { Backdrop, CircularProgress } from "@mui/material";
import React from "react";

type Props = {};

const LoadingPage = (props: Props) => {
  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={true}
      //   onClick={handleClose}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default LoadingPage;
