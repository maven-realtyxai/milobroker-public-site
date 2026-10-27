import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// Load Bootstrap Icons once; Vite bundles its CSS and font files locally (no CDN).
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/global.css";

// Mount into index.html’s root once. StrictMode helps expose unsafe effects during development.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
