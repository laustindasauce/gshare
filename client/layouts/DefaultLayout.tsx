import * as React from "react";
import Box from "@mui/material/Box";
import Footer from "@/components/global/Footer";
import galleryGlobalTheme from "@/styles/galleryTheme";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
} from "@mui/material";

type Props = {
  children: JSX.Element;
};

const DefaultLayout = ({ children }: Props) => {
  let theme = createTheme({
    palette: {
      mode: "light",
      ...galleryGlobalTheme,
    },
    typography: {
      // fontFamily: ["Abhaya Libre", "sans-serif"].join(","),
      fontFamily: ["Inconsolata", "monospace"].join(","),
    },
  });

  theme = responsiveFontSizes(theme);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {children}
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: "auto",
          }}
        >
          <Footer />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DefaultLayout;
