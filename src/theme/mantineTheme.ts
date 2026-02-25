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
      styles: (theme) => ({
        root: {
          lineHeight: 1.5,
          color: theme.colors.gray[6],
          marginTop: theme.spacing.md,
        },
      }),
    },
  },
})
