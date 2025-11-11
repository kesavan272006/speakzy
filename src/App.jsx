import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import SignInPage from './pages/signInPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LevelPage from './pages/LevelPage.jsx';
import Level1 from './pages/Level1.jsx';
import Level2 from './pages/Level2.jsx';
import Level3 from './pages/Level3.jsx';
import Level4 from './pages/Level4.jsx';
import Level5 from './pages/Level5.jsx';
import Level6 from './pages/Level6.jsx';
import Level7 from './pages/Level7.jsx';
import Level8 from './pages/Level8.jsx';
import PracticePage from './pages/PracticePage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import DictionaryPage from './pages/DictionaryPage.jsx';
import ProfilePage from './pages/profilePage.jsx';
function App() {
  return (
    <div className="min-h-screen bg-bg-primary w-full overflow-x-hidden">
      <main className="w-full">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/level/:id" element={<LevelPage />} />
          <Route path="/levels/1" element={<Level1 />} />
          <Route path="/levels/2" element={<Level2 />} />
          <Route path="/levels/3" element={<Level3 />} />
          <Route path="/levels/4" element={<Level4 />} />
          <Route path="/levels/5" element={<Level5 />} />
          <Route path="/levels/6" element={<Level6 />} />
          <Route path="/levels/7" element={<Level7 />} />
          <Route path="/levels/8" element={<Level8 />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/dictionary" element={<DictionaryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}
export default App;