import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import profileLogo from '/src/assets/EW.png'
import { useNavigate } from 'react-router-dom';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function TvPreviewPage() {
    return (<>
        <header className="fixed top-0 left-0 w-full z-[1000] bg-[#09090b] border-b border-gray-600 shadow-md">
            <nav className="max-w-screen-xl mr-auto px-0 py-2 flex items-center justify-between">
                <div className="mx-3 px-4 py-2 pr-12 flex items-center w-full">
                <div className="flex items-center space-x-8">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2 text-xl font-semibold text-white hover:text-blue-600">
                    <img src={profileLogo} alt="logo" className="w-8 h-8 rounded-full" />
                    Eric's Projects
                    </a>

                    {/* Nav Links */}
                    <div className="hidden md:flex gap-6">
                    <a href="/" className="text-white hover:text-slate-500 font-medium">Home</a>
                    <a href="#about" className="text-white hover:text-slate-500 font-medium">Movies</a>
                    <a href="#education" className="text-white hover:text-slate-500 font-medium">TV Shows</a>
                    <a href="#project" className="text-white hover:text-slate-500 font-medium">Anime</a>
                    <a href="#contact" className="text-white hover:text-slate-500 font-medium">Books</a>
                    <a href="#contact" className="text-white hover:text-slate-500 font-medium">Actors</a>
                    </div>
                </div>
                </div>
            </nav>
        </header>

        <main>
            <p>you are in the tv preview page</p>
        </main>
    </>);
}