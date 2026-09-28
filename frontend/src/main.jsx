import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { App } from "./App";
import "./styles.css";

import { ThemeManager } from "./utils/theme";


/* =========================================================
   APPLY SAVED THEME / DEFAULT LIGHT THEME
========================================================= */

ThemeManager.initialize();


/* =========================================================
   RENDER APPLICATION
========================================================= */

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);