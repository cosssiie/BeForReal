import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import ChatPage from './components/ChatPage';
import Chat from './components/Chat';
import Login from './components/Login';
import SignUp from './components/SignUp';
import PostPage from './components/PostPage';
import ProfilePage from './components/ProfilePage';
import AdminPage from './components/AdminPage';
import OtherUserProfile from './components/OtherUserProfile';
import Sidebar from './components/Sidebar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userIsModerator, setUserIsModerator] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (loggedIn) {
      setIsLoggedIn(true);

      fetch('/api/current_user')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch current user');
          return res.json();
        })
        .then(data => {
          setCurrentUserId(data.id);
          setUserIsModerator(data.is_moderator);
          setUser(data);
        })
        .catch(err => {
          console.error('Failed to fetch current user:', err);
          setIsLoggedIn(false);
          setUser(null);
          setCurrentUserId(null);
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userId');
        });
    }
  }, []);

  const handleLogin = (userId) => {
    setIsLoggedIn(true);
    setCurrentUserId(userId);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userId', userId);

    // Після логіну можна також завантажити user info
    fetch('/api/current_user')
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(() => setUser(null));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserId(null);
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
  };

  return (
    <Router>
      {/* {isLoggedIn && <Sidebar />} */}
      {isLoggedIn}
      <div className="App">
        <Routes>
          {!isLoggedIn ? (
            <>
              <Route path="*" element={<Login onLogin={handleLogin} />} />
              <Route path="/sign up" element={<SignUp />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/home" element={<HomePage userId={currentUserId} onLogout={handleLogout} />} />
              <Route path="/chats" element={<ChatPage userId={currentUserId} />} />
              <Route path="/chats/:chatId?" element={<ChatPage userId={currentUserId} />} />
              <Route path="/chats/:id" element={<Chat userId={currentUserId} />} />
              <Route path="/profile" element={<ProfilePage />} />

              <Route
                path="/admin-panel"
                element={user?.is_moderator ? <AdminPage /> : <Navigate to="/home" />}
              />

              <Route path="/posts/:postId" element={<PostPage userId={currentUserId} user={user} />} />
              <Route path="/profile/:id" element={<OtherUserProfile />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
