import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./app.css";
import App from "./App";
import { FormOptionsProvider } from "./components/FormOptionContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FormOptionsProvider>
      <App />
    </FormOptionsProvider>
  </StrictMode>
);

