import { createTheme } from "@mantine/core"
import { appFontFamily, headingSizes } from "./fonts"

export const mantineTheme = createTheme({
  fontFamily: appFontFamily,
  headings: {
    fontFamily: appFontFamily,
    fontWeight: "700",
    sizes: headingSizes,
  },
  components: {
    Text: {
      defaultProps: {
        size: "sm",
      },
      styles: {
        root: {
          lineHeight: 1.5,
        },
      },
    },
    Title: {
      styles: {
        root: {
          letterSpacing: "-0.01em",
        },
      },
    },
  },
})
