import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {Home } from './components/Home.tsx'
import TvPreviewPage from './components/TvPreviewPage';
import MoviePreviewPage from './components/MoviePreviewPage';
import PersonPreviewPage from './components/PersonPreviewPage';
import { BrowserRouter, Routes , Route} from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path="/preview/movie/:id/:source" element={<MoviePreviewPage />} />
        <Route path="/preview/tv/:id/:source" element={<TvPreviewPage />} />
        <Route path="/preview/person/:id/:source" element={<PersonPreviewPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
