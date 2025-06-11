import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./polyfills";

try {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error rendering app:', error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div className="min-h-screen flex items-center justify-center bg-dark-primary text-dark-text">
        <div className="text-center p-4">
          <h2 className="text-xl font-semibold mb-2">Application Error</h2>
          <p className="text-red-500">${error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
        </div>
      </div>
    `;
  }
}
