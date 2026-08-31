import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { store } from './shared/store/store';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>
);
