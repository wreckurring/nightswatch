import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { LandingPage } from './pages/LandingPage'
import { LobbyPage } from './pages/LobbyPage'
import { WatchRoomPage } from './pages/WatchRoomPage'
import { ToastContainer } from './components/ui/Toast'
import { PageWrapper } from './components/layout/PageWrapper'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={<PageWrapper><LandingPage /></PageWrapper>}
        />
        <Route
          path="/lobby"
          element={<PageWrapper><LobbyPage /></PageWrapper>}
        />
        <Route
          path="/room/:roomCode"
          element={<WatchRoomPage />}   // no wrapper — full-screen, manages its own transitions
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
