import { Routes, Route, useLocation } from 'react-router-dom';
import GetStarted from './pages/GetStarted';
import Emergency from './pages/Emergency';
import AuthChoice from './pages/AuthChoice';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Medic from './pages/Medic';
import Message from './pages/Message';
import Profile from './pages/Profile';
import Location from './pages/Location';
import Dashboard from './pages/Dashboard';
import BottomNav from './components/BottomNav';
import './App.css';
import FirstAidDetail from './pages/FirstAidDetail';

function App() {
  const location = useLocation();
  
  // Define paths where BottomNav should be hidden
  const hideNavPaths = ['/', '/start', '/login', '/signup'];
  const showNav = !hideNavPaths.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<GetStarted />} />
        <Route path="/start" element={<AuthChoice />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/home" element={<Home />} />
        <Route path="/medic" element={<Medic />} />
        <Route path="/medic/:slug" element={<FirstAidDetail />} />
        <Route path="/message" element={<Message />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/location" element={<Location />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  );
}

export default App;
