import { PaletteOptions } from "@mui/material";
import { orange } from "@mui/material/colors";

const galleryGlobalTheme: PaletteOptions = {
  primary: {
    main: process.env.NEXT_PUBLIC_GALLERY_THEME_PRIMARY || "#2E8555",
    contrastText: process.env.NEXT_PUBLIC_GALLERY_THEME_TEXT || "#ffffff",
  },

  secondary: {
    main: orange[600],
  },

  info: {
    main: "#fff",
  },
};

export default galleryGlobalTheme;
