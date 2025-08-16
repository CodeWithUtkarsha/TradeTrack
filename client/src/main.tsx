import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🚀 Main.tsx: Starting React app...");

try {
  const rootElement = document.getElementById("root");
  console.log("🎯 Root element found:", rootElement);
  
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  const root = createRoot(rootElement);
  console.log("✅ React root created successfully");
  
  root.render(<App />);
  console.log("✅ App rendered successfully");
} catch (error) {
  console.error("❌ Error in main.tsx:", error);
}
