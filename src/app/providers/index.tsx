import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@shared/store";
import { ToastContainer } from "@shared/components/Toast/ToastContainer";
import { ErrorBoundary } from "@app/layouts/ErrorBoundary";
import { Unauthorized } from "@app/layouts/Unauthorized";
import { NotFound } from "@app/layouts/NotFound";

interface Props { children: ReactNode; }

export function AppProviders({ children }: Props) {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ErrorBoundary>
          {children}
          <ToastContainer />
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  );
}
