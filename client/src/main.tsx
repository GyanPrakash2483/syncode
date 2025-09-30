import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PrimeReactProvider } from 'primereact/api';
import { BrowserRouter, Route, Routes } from 'react-router';
import Codespace from './Codespace.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrimeReactProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<App />} />
          <Route path='/codespace/:codespaceId' element={<Codespace />} />
        </Routes>      
      </BrowserRouter>
    </PrimeReactProvider>
  </StrictMode>,
)
