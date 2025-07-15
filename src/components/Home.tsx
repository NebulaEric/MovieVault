import React from "react"
import reactLogo from '/src/assets/react.svg'
import viteLogo from '/vite.svg'
import profileLogo from '/src/assets/EW.png'
import '@/styles/Home.css'
import { useState, useEffect } from 'react'
import { Outlet } from "react-router-dom"
import  Modal  from './Modal';
import AddMovieForm from '../components/AddMovieForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom';

// const [title, setTitle] = useState('');
// const [year, setYear] = useState('');
// const [overview, setOverview] = useState('');
// const [posterPath, setPosterPath] = useState('');

interface Movie {
  title: string;
  overview: string;
  poster: string;
  id: number;
  year: number;
  tmdb_id: number;
}

export const Home: React.FC = () => {
    const [count, setCount] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [movies, setMovies] = useState<Movie[]>([]);

    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/movies');
        const data = await response.json();
        if (data.success) {
          setMovies(data.data);
        } else {
          console.error('Failed to load movies');
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
      }
    };
    useEffect(() => {fetchMovies();}, []);

    return <>
        <header>
          <nav>
            <div className="container nav">
              <a className="profileLogo" href="/"><img src={profileLogo} alt="logo"/>Eric's Projects</a>
              {/* <!-- Navigation Links --> */}
              <div className="navLinks">
                <a className="button" href="/">Home</a>
                <a className="button" href="#about">Movies</a>
                <a className="button" href="#education">TV Shows</a>
                <a className="button" href="#project">Anime</a>
                <a className="button" href="#contact">Books</a>
                <a className="button" href="#contact">Actors</a>
                
              </div>
              <a className = "searchButton" onClick={() => setIsModalOpen(true)}><FontAwesomeIcon icon={faMagnifyingGlass} />Add Movie</a>
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h2>Movie Info</h2>
                <AddMovieForm onClose={() => {setIsModalOpen(false); fetchMovies();}} />
                <p>This is a pop-up modal over the app screen.</p>
                </Modal>
            </div>
          </nav>
        </header>

        <main>
          <div>
            {/* <button className = "addMovie" onClick={() => setIsModalOpen(true)}>Add Movie</button> */}

            <div className="movieCardSection">
              {movies.map((movie) => (
                <Link
                  to={{
                    pathname: `/library/${movie.id}`,
                    // state: { movie }, // optional: pass movie data
                  }}
                  key={movie.id}
                  className="movieCard"
                >
                  <div className="movieCardImg">
                    <img src={movie.poster ? `${movie.poster}` : '/NoPoster.png'} alt={movie.title} />
                  </div>
                  <div className="movieCardBody">
                    <p className="movieName">{movie.title} ({movie.year})</p>
                  </div>
                </Link>
              ))}
            </div>
              {/* <a href = "" className="movieCard" key={movie.id}>
                  <div className="movieCardImg">
                    <img src={movie.poster ? `${movie.poster}` : '/NoPoster.png'} alt={movie.title} />
                  </div>
                  <div className="movieCardBody">
                    <p className="movieName">{movie.title} ({movie.year})</p>
                  </div>
                </a> */}
            
            {/* <a href="https://vite.dev" target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a> */}
          </div>
          {/* <h1>Vite + React</h1>
          <div className="testButtons">
            <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
            <button onClick={() => setCount((_count) => 0)}>Reset Count</button>
            <p>Edit <code>src/App.tsx</code> and save to test HMR and the routes</p>
          </div>
          <p className="read-the-docs">Click on the Vite and React logos to learn more</p> */}
          <p className="needscroll">Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
        </main>
        <Outlet />
     </>
}