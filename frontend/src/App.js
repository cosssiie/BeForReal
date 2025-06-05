import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import ChatPage from './components/ChatPage';
import Login from './components/Login';
import SignUp from './components/SignUp';
import PostPage from './components/PostPage';
import ProfilePage from './components/ProfilePage';

// import Settings from './components/SettingsPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  //const [userId, setUserId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUserId = localStorage.getItem('userId');
    if (loggedIn && storedUserId) {
      setIsLoggedIn(true);
      setCurrentUserId(parseInt(storedUserId));
    }
  }, []);

  const handleLogin = (userId) => {
    setIsLoggedIn(true);
    setCurrentUserId(userId);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userId', userId);
  };


  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserId(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
  };

  return (
    <Router>
      {isLoggedIn && <Navigation onLogout={handleLogout} />}

      <div className="App" style={{ marginTop: isLoggedIn ? '70px' : '0' }}>
        <Routes>
          {!isLoggedIn ? (
            <>
              <Route path="*" element={<Login onLogin={handleLogin} />} />
              <Route path="/sign up" element={<SignUp/>} />
            </>
          ) : (
            <>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/home" element={<HomePage userId={currentUserId} />} />
              <Route path="/chats" element={<ChatPage userId={currentUserId} />} />
              <Route path="/profile" element={<ProfilePage onLogout={handleLogout} />} />
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