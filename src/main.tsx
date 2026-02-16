import React from "react";
import { createRoot } from "react-dom/client";
import { applyTheme, getTheme } from "@/lib/theme";
import App from "./App.tsx";
import "./index.css";

// Apply saved theme before render to avoid flash
applyTheme(getTheme());

createRoot(document.getElementById("root")!).render(<App />);
