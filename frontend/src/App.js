import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import ChatPage from './components/ChatPage';

// import Profile from './components/ProfilePage';
// import Settings from './components/SettingsPage';

function App() {
  return (
    <Router>
      <div className="App" style={{ paddingTop: '70px' }}>
        <Navigation />

        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/chats" element={<ChatPage />} />
          {/* <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />  */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
