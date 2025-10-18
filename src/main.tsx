import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./app.css";
import App from "./App";
import { FormOptionsProvider } from "./components/FormOptionContext";
import { AuthProvider } from "./contexts/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <FormOptionsProvider>
        <App />
      </FormOptionsProvider>
    </AuthProvider>
  </StrictMode>
);
