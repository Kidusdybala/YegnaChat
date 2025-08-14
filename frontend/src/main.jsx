// Add this at the top of the file, before any other imports
if (typeof global === 'undefined') {
  window.global = window;
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { AuthContextProvider } from './context/AuthContext';
import { SocketContextProvider } from './context/SocketContext';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          <SocketContextProvider>
            <App />
          </SocketContextProvider>
        </AuthContextProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
