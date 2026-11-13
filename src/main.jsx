import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './pages/Home'
import Match from './pages/Match'
import Squad from './pages/Squad'
import Player from './pages/Player'
import History from './pages/History'
import Article from './pages/Article'
import Tournament from './pages/Tournament'
import { LegacyMatchRedirect, NotFound } from './season'
import './index.css'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Nav />
      <main>
        <Routes>
          {/* Newest season, no prefix */}
          <Route path="/" element={<Home />} />
          <Route path="/squad" element={<Squad />} />
          <Route path="/player/:id" element={<Player />} />
          <Route path="/match/:id" element={<LegacyMatchRedirect />} />

          {/* A specific season: /2025-26, /2026-27, ... */}
          <Route path="/:season" element={<Home />} />
          <Route path="/:season/squad" element={<Squad />} />
          <Route path="/:season/match/:id" element={<Match />} />
          <Route path="/:season/player/:id" element={<Player />} />
          <Route path="/:season/tournament/:id" element={<Tournament />} />

          {/* Cross-season */}
          <Route path="/history" element={<History />} />
          <Route path="/history/:id" element={<Article />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
