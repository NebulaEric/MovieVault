import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {Layout } from './components/Layout.tsx'
import { BrowserRouter, Routes , Route} from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
