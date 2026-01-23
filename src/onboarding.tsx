import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { OnboardingApp } from "./components/OnboardingApp";
import { ErrorBoundary } from "./components/onboarding/ErrorBoundary";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <OnboardingApp />
    </ErrorBoundary>
  </StrictMode>,
);
