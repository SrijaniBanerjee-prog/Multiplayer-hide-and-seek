import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RoomProvider } from './context/RoomContext';
import { useRoom } from './hooks/useRoom';
import Navbar from './components/Navbar/Navbar';
import Toast from './components/Toast/Toast';
import Home from './pages/Home/Home';
import CreateRoom from './pages/CreateRoom/CreateRoom';
import JoinRoom from './pages/JoinRoom/JoinRoom';
import Lobby from './pages/Lobby/Lobby';
import Game from './pages/Game/Game';
import './App.css';

// Separate AppContent to allow using RoomContext hooks
const AppContent = () => {
  const { toast } = useRoom();

  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateRoom />} />
          <Route path="/join" element={<JoinRoom />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </main>
      <Toast message={toast} />
    </div>
  );
};

export const App = () => {
  return (
    <RoomProvider>
      <Router>
        <AppContent />
      </Router>
    </RoomProvider>
  );
};

export default App;
