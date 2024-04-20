import * as React from "react";
import {
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
} from "@mui/material";
import Footer from "@/components/global/Footer";
import globalTheme from "@/styles/globalTheme";

type Props = {
  children: JSX.Element;
};

export default function LoginLayout({ children }: Props) {
  let theme = createTheme({
    palette: {
      mode: "light",
      ...globalTheme,
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
        <Container disableGutters maxWidth={false}>
          {children}
        </Container>
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: "auto",
          }}
        >
          <Footer layout="admin" />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
