import { Route, Routes } from 'react-router-dom'
import { EventProvider } from './context/EventContext.jsx'
import LandingPage from './pages/LandingPage.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import LeaderboardPage from './pages/LeaderboardPage.jsx'
import GamesPage from './pages/GamesPage.jsx'
import BonusPage from './pages/BonusPage.jsx'
import WheelPage from './pages/WheelPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

/**
 * Root application component: sets up the event context and top-level
 * routes. See docs/implementation_plan.md Phase 3.
 */
function App() {
  return (
    <EventProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/event" element={<DashboardLayout />}>
          <Route index element={<LeaderboardPage />} />
          <Route path="games" element={<GamesPage />} />
          <Route path="bonus" element={<BonusPage />} />
          <Route path="wheel" element={<WheelPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </EventProvider>
  )
}

export default App
