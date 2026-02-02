// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#FF7A18",          // Orange (Add Deed button)
      light: "#FFF1E6",
      dark: "#E56A0F",
      contrastText: "#ffffff",
    },

    secondary: {
      main: "#6B7280",          // Neutral gray
      light: "#9CA3AF",
      dark: "#374151",
      contrastText: "#ffffff",
    },

    divider: "#E5E7EB",
  },
  
//   typography: {
//     fontFamily: "Poppins, system-ui, -apple-system, sans-serif",
//   },
});

export default theme;
