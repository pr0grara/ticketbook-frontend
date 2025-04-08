import React, { startTransition } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.scss";
import App from "./components/app";
import store from "./redux/store";
import reportWebVitals from "./reportWebVitals";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from 'react-dnd-touch-backend';
import DragPreview from './components/DragPreview';

const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
const getBackend = () => (isTouchDevice ? TouchBackend : HTML5Backend);

//Make sure we don't block drag events on mobile
document.addEventListener("touchmove", (event) => {
  if (event.target.closest(".dnd-item")) { // Ensure only drag items prevent scrolling
    event.preventDefault();
  }
}, { passive: false });

const router = createBrowserRouter([
  { path: "/", element: <App page="login" /> },
  { path: "/login", element: <App page="login" /> },
  { path: "/tickets", element: <App page="tickets" /> },
  { path: "/goals", element: <App page="goals" /> },
  { path: "/plan", element: <App page="plan" /> },
  { path: "/calendar", element: <App page="calendar" /> },
  { path: "/baseline", element: <App page="baseline" /> }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

document.addEventListener("DOMContentLoaded", () => {
  window.store = store;
  const root = ReactDOM.createRoot(document.getElementById("root"));

  startTransition(() => {
    root.render(
      <Provider store={store}>
        <DndProvider backend={getBackend()}>
          <RouterProvider router={router} /> {/* ✅ Wrap App inside RouterProvider here */}
          {/* <DragPreview /> */}
        </DndProvider>
      </Provider>
    );
  });

  reportWebVitals();
});
