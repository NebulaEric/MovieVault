import React from "react"
import reactLogo from '/src/assets/react.svg'
import viteLogo from '/vite.svg'
import profileLogo from '/src/assets/EW.png'
import './Home.css'
import { useState } from 'react'
import { Outlet } from "react-router-dom"
import  Modal  from './Modal';

export const Home: React.FC = () => {
    const [count, setCount] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false);
    return <>
        <header>
          <nav>
            <div className="container nav">
              <a className="profileLogo" href="index.html"><img src={profileLogo} alt="logo"/>Eric's Projects</a>
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

        <main>
          <div>
            <button className = "addMovie" onClick={() => setIsModalOpen(true)}>Add Movie</button>

            <div className="movieCardSection">
              <div className="movieCard">
                <div className="movieCardImg"><img src="/src/assets/DUNGEONS_DRAGONS.webp" alt="" />

                </div>
                <div className="movieCardBody">
                  <p className="movieName">Dungeons & Dragons</p>
                </div>
                
              </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <h2>Movie Info</h2>
            <p>This is a pop-up modal over the app screen.</p>
            </Modal>
            <a href="https://vite.dev" target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
          <h1>Vite + React</h1>
          <div className="testButtons">
            <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
            <button onClick={() => setCount((_count) => 0)}>Reset Count</button>
            <p>Edit <code>src/App.tsx</code> and save to test HMR and the routes</p>
          </div>
          <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
          <p className="needscroll">Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
        </main>
        <Outlet />
     </>
}