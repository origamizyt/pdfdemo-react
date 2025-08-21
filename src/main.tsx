import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import * as pdf from 'pdfjs-dist';
pdf.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.mjs';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
