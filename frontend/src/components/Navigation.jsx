import { Link } from 'react-router-dom';

function Navigation() {
    return (
        <header className="header-nav">
            <Link to="/home" className="header-btn">
                <img src="/assets/images/home.png" alt="Home" className="icon" />
            </Link>

            <Link to="/chats" className="header-btn">
                <img src="/assets/images/chat-bubble.png" alt="Chats" className="icon" />
            </Link>

            <Link to="/profile" className="header-btn">
                <img src="/assets/images/user.png" alt="Profile" className="icon" />
            </Link>

            {/* moderator */}
            <Link to="/admin-panel" className="header-btn">
                <img src="/assets/images/headset.png" alt="Admin" className="icon" />
            </Link>
        </header>
    );
}

export default Navigation;
