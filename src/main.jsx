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
import './index.css'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Nav />
      <main style={{ paddingTop: '56px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/match/:id" element={<Match />} />
          <Route path="/squad" element={<Squad />} />
          <Route path="/player/:id" element={<Player />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:id" element={<Article />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
