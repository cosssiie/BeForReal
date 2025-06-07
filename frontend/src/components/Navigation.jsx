import { Link } from 'react-router-dom';
import { UserRound, MessageCircleMore, House, Headset} from 'lucide-react';

function Navigation() {
    return (
        <header className="header-nav">
            <Link to="/home" className="header-btn">
                <House alt="Home" className="icon" />
            </Link>

            <Link to="/chats" className="header-btn">
                <MessageCircleMore alt="Chats" className="icon" />
            </Link>

            <Link to="/profile" className="header-btn">
                <UserRound alt="Profile" className="icon" />
            </Link>

            {/* moderator */}
            <Link to="/admin-panel" className="header-btn">
                <Headset alt="Admin" className="icon" />
            </Link>
        </header>
    );
}

export default Navigation;
