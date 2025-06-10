import { Link } from 'react-router-dom';
import { UserRound, MessageCircleMore, House, Headset } from 'lucide-react';

function Navigation({ user }) {
    return (
        <header className="header-nav">
            <Link to="/home" className="header-btn">
                <House alt="Home" className="nav-icon" size={25} />
            </Link>

            <Link to="/chats" className="header-btn">
                <MessageCircleMore alt="Chats" className="nav-icon" size={25} />
            </Link>

            <Link to="/profile" className="header-btn">
                <UserRound alt="Profile" className="nav-icon" size={25} />
            </Link>

            {user?.is_moderator && (
                <Link to="/admin-panel" className="header-btn">
                    <Headset alt="Admin" className="nav-icon" size={25} />
                </Link>
            )}
        </header>
    );
}

export default Navigation;
