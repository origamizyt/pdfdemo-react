import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/index.css'

import * as pdf from 'pdfjs-dist';
pdf.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.mjs';

import { createBrowserRouter, RouterProvider } from 'react-router'
import Home from './pages/Home.tsx';
import View from './pages/View.tsx';
import List from './pages/List.tsx';
import { createHead, UnheadProvider } from '@unhead/react/client';

const router = createBrowserRouter([
  {
    index: true,
    Component: Home
  },
  {
    path: '/list',
    Component: List,
  },
  {
    path: '/view/:bookId',
    Component: View
  }
]);

const head = createHead({
  init: [{
    titleTemplate(title) {
      return title ? `${title} | PDF Viewer` : 'PDF Viewer'
    }
  }]
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UnheadProvider head={head}>
      <RouterProvider router={router} />
    </UnheadProvider>
  </StrictMode>,
)
