import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from "react-redux";
import './index.scss';
import Root from './components/root';
import store from "./redux/store";
import reportWebVitals from './reportWebVitals';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";


document.addEventListener('DOMContentLoaded', () => {
  window.store = store;
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js").then(
        (reg) => console.log("✅ Service Worker registered:", reg.scope),
        (err) => console.error("❌ Service Worker registration failed:", err)
      );
    });
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <Root />
      </DndProvider>
    </Provider>
  );
  reportWebVitals();
});