import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from 'react-router-dom';
import '@mantine/core/styles.css'; // wrong order

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <MantineProvider>
        <App />
      </MantineProvider>
    </BrowserRouter>
  </StrictMode>,
)
