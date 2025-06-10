import { Link } from 'react-router-dom';
import { UserRound, MessageCircleMore, House, Headset, LogOut } from 'lucide-react';

function Navigation({ user }) {
    return (
        <header className="header-nav">
            <Link to="/home" className="header-btn">
                <House alt="Home" className="nav-icon" size={25} />
                <label className="label">Home</label>
            </Link>

            <Link to="/chats" className="header-btn">
                <MessageCircleMore alt="Chats" className="nav-icon" size={25} />
                <label className="label">Messages</label>
            </Link>

            <Link to="/profile" className="header-btn">
                <UserRound alt="Profile" className="nav-icon" size={25} />
                <label className="label">Profile</label>
            </Link>

            {user?.is_moderator && (
                <Link to="/admin-panel" className="header-btn">
                    <Headset alt="Admin" className="nav-icon" size={25} />
                    <label className="label">Admin Panel</label>
                </Link>
            )}
            <Link to="/login" className="header-btn">
                <LogOut alt="Logout" className="nav-icon" size={25} />
                <label className="label">Log Out</label>
            </Link>

        </header>
    );
}

export default Navigation;