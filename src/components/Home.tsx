import React from "react"
import reactLogo from '/src/assets/react.svg'
import viteLogo from '/vite.svg'
import profileLogo from '/src/assets/EW.png'
import './Home.css'
import { useState } from 'react'
import { Outlet } from "react-router-dom"

export const Home: React.FC = () => {
    const [count, setCount] = useState(0)
    return <>
        <header>
        <nav>
            <div className="container nav">
                <a className="logo" href="index.html"><img src={profileLogo} alt="logo"/>Eric's Projects</a>

                <button className="hamburger">☰</button>

  {/* <!-- Navigation Links --> */}
                <div className="navLinks">
                    <a className="button" href="#hello">update</a>
                    <a className="button" href="#about">About</a>
                    <a className="button" href="#education">Education</a>
                    <a className="button" href="#project">Projects</a>
                    <a className="button" href="#contact">Contact</a>
                </div>
            
            </div>
        </nav>
      </header>
        <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={() => setCount((count) => 0)}>
          Reset Count
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR and the routes
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      
    <Outlet />
    </>
}