import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { GlobalDataProvider } from "./context/GlobalDataContext.tsx";
import { Toaster } from "sonner";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <GlobalDataProvider>
        <App />
      </GlobalDataProvider>
      <Toaster richColors position="top-center" />
    </ConvexProvider>
  </React.StrictMode>
);
