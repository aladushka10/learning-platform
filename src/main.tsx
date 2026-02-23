import React from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { MantineProvider } from "@mantine/core"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import App from "./App"
import store from "./store"
import { mantineTheme } from "./theme/mantineTheme"
import "./index.css"
import "katex/dist/katex.min.css"
import "@mantine/core/styles.css"

const container = document.getElementById("root")!
const root = createRoot(container)
const queryClient = new QueryClient()

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={mantineTheme}>
          <App />
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
)
