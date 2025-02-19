import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.scss";
import App from "./App.tsx";
import { Provider } from "react-redux";
import store, { persistor } from "./redux/store.ts";
import { BrowserRouter } from "react-router-dom";

import { PersistGate } from "redux-persist/integration/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
