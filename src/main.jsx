import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Loader from "./components/molecules/Loader.jsx";
import "./index.css";

export function Root() {
  return (
    <>
      <Loader /> {/* sits globally at top */}
      <App /> {/* app below */}
    </>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
