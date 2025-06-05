import { Link } from 'react-router-dom';

function Navigation() {
    return (
        <header className="header-nav">
            <Link to="/home" className="header-btn">
                <img src="/assets/images/home.png" alt="Home" className="icon" />
                {/* <span>Home</span> */}
            </Link>

            <Link to="/chats" className="header-btn">
                <img src="/assets/images/chat-bubble.png" alt="Chats" className="icon" />
                {/* <span>Chats</span> */}
            </Link>

            <Link to="/profile" className="header-btn">
                <img src="/assets/images/user.png" alt="Profile" className="icon" />
                {/* <span>Profile</span> */}
            </Link>
        </header>
    );
}

export default Navigation;
