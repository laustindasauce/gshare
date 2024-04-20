import Grid from "@mui/material/Unstable_Grid2";
import React from "react";

type Props = {
  src: string;
};

const Logo = ({ src }: Props) => {
  return (
    <Grid
      container
      sx={{ p: 2 }}
      direction="row"
      justifyContent={"center"}
      alignContent={"center"}
    >
      <Grid xs="auto">
        {/* eslint-disable @next/next/no-img-element */}
        <img
          style={{ width: "100%", maxWidth: "250px" }}
          src={src}
          alt={`${process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME} Logo`}
        />
      </Grid>
    </Grid>
  );
};

export default Logo;
