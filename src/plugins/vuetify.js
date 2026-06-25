import "vuetify/styles";
import { createVuetify } from "vuetify";
import "@mdi/font/css/materialdesignicons.css";

const libraryTheme = {
  dark: false,
  colors: {
    background: "#F8FAF6",
    surface: "#FFFFFF",
    primary: "#064E3B",
    "primary-darken-1": "#022C22",
    secondary: "#9B4500",
    accent: "#F59E0B",
    success: "#059669",
    warning: "#D97706",
    error: "#DC2626",
    info: "#0284C7",
  },
};

export default createVuetify({
  theme: {
    defaultTheme: "libraryTheme",
    themes: {
      libraryTheme,
    },
  },
  defaults: {
    VCard: {
      rounded: "xl",
      elevation: 0,
    },
    VBtn: {
      rounded: "lg",
      elevation: 0,
    },
    VTextField: {
      variant: "outlined",
      density: "comfortable",
      rounded: "lg",
    },
    VSelect: {
      variant: "outlined",
      density: "comfortable",
      rounded: "lg",
    },
    VTextarea: {
      variant: "outlined",
      density: "comfortable",
      rounded: "lg",
    },
    VChip: {
      rounded: "lg",
    },
  },
});
