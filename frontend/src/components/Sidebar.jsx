import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar({ isOpen }) {
    return (
        <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
            <div className="custom-sidebar">
                <div className="menu">
                    <div className="menu-title">Menu</div>
                    <Link to="/" className="menu-link">
                        <img src="/assets/images/settings.png" alt="icon" className="icon" />
                        <span className="label">Something</span>
                    </Link>
                    <Link to="/" className="menu-link">
                        <img src="/assets/images/settings.png" alt="icon" className="icon" />
                        <span className="label">Something</span>
                    </Link>
                </div>
                <div className="menu">
                    <div className="menu-title">Links</div>
                    <Link to="/" className="menu-link">
                        <img src="/assets/images/settings.png" alt="icon" className="icon" />
                        <span className="label">Something</span>
                    </Link>
                    <Link to="/" className="menu-link">
                        <img src="/assets/images/settings.png" alt="icon" className="icon" />
                        <span className="label">Something</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;