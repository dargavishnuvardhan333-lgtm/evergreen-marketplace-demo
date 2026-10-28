import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { StoreProvider } from './context/StoreContext.jsx';
import './index.css';

const currentUrl = new URL(window.location.href);
const redirect = currentUrl.searchParams.get('__pages_route');
if (redirect) {
  currentUrl.searchParams.delete('__pages_route');
  const destination = new URL(`${import.meta.env.BASE_URL}${redirect}`, window.location.origin);
  if (destination.origin === window.location.origin && destination.pathname.startsWith(import.meta.env.BASE_URL)) {
    window.history.replaceState(null, '', `${destination.pathname}${destination.search}${destination.hash}`);
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <StoreProvider>
        <App />
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
