import React from 'react'
import ReactDOM from 'react-dom/client';
import './index.css'
import App from './App.jsx'
import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from 'react-router-dom';
import '@mantine/core/styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <MantineProvider>
        <App />
      </MantineProvider>
    </BrowserRouter>,
  </React.StrictMode>
)
