import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'
import {Home } from './components/Home.tsx'
import LibraryPreviewPage from './components/LibraryPreviewPage';
import TvPreviewPage from './components/TvPreviewPage';
import PersonPreviewPage from './components/PersonPreviewPage';
import { BrowserRouter, Routes , Route} from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path="/preview/movie/:id/:source" element={<LibraryPreviewPage />} />
        <Route path="/preview/tv/:id/:source" element={<TvPreviewPage />} />
        <Route path="/preview/person/:id/:source" element={<PersonPreviewPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
