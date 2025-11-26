import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Force dark theme
document.documentElement.classList.add('dark');
document.documentElement.style.colorScheme = 'dark';

createRoot(document.getElementById("root")!).render(<App />);
