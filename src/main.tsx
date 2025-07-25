import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from 'sonner';
import App from "./App";
import "./index.css";
import { initializeCoreEngine } from './lib/core';

// 初始化核心引擎
initializeCoreEngine().then(() => {
  console.log('Core engine initialized successfully');
  
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
      <Toaster />
    </StrictMode>
  );
}).catch((error) => {
  console.error('Failed to initialize core engine:', error);
  
  // 即使核心引擎初始化失败，也要渲染应用
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
      <Toaster />
    </StrictMode>
  );
});
