import { Grid, Link, Typography } from "@mui/material";
import React from "react";

type Props = {
  layout?: string;
};

const Footer = (props: Props) => {
  return (
    <Grid container sx={{ mt: 5, mb: 2 }} justifyContent="center">
      {props.layout !== "admin" && (
        <Grid item xs="auto">
          <Typography variant="caption" textAlign="center">
            Copyright &copy; {new Date().getFullYear()} -{" "}
            <Link
              className="simple-link"
              href={process.env.NEXT_PUBLIC_PHOTOGRAPHER_WEBSITE}
              target="_blank"
              underline="hover"
              color="inherit"
            >
              {process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME}
            </Link>
          </Typography>
        </Grid>
      )}
      <Grid item xs={12}></Grid>
      {props.layout === "admin" ? (
        <Grid sx={{ mt: 2 }} item xs="auto">
          <Typography variant="caption">
            gshare {process.env.NEXT_PUBLIC_APP_VERSION}
          </Typography>
        </Grid>
      ) : process.env.NEXT_PUBLIC_POWERED_BY_ENABLED?.toLowerCase() !==
        "false" ? (
        <Grid sx={{ mt: 2 }} item xs="auto">
          <Link
            color="inherit"
            underline="hover"
            variant="caption"
            href="https://github.com/austinbspencer/gshare"
            target="_blank"
          >
            Powered by gshare
          </Link>
        </Grid>
      ) : null}
    </Grid>
  );
};

export default Footer;
