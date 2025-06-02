import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import ChatPage from './components/ChatPage';
import Login from './components/Login';
import PostPage from './components/PostPage';


// import Profile from './components/ProfilePage';
// import Settings from './components/SettingsPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [userRole, setUserRole] = useState(null);

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    // setUserRole(role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    // setUserRole(null);
  };
  return (
    <Router>
      {isLoggedIn && <Navigation onLogout={handleLogout} />}

      <div className="App" style={{ paddingTop: isLoggedIn ? '70px' : '0' }}>
        <Routes>
          {!isLoggedIn ? (
            <>
              <Route path="*" element={<Login onLogin={handleLogin} />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/home" element={<HomePage userId={2}/>} />
              <Route path="/chats" element={<ChatPage userId={2} />} />
              <Route path="/login" element={<Navigate to="/home" />} />
              <Route path="/posts/:postId" element={<PostPage />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;