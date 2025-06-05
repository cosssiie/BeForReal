import { Search, SlidersHorizontal } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar({ isOpen }) {
    return (
        <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
            <div className="custom-sidebar">
                <div className="menu">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="search-input"
                        />
                        <button className="search-button">
                            <Search size={25} className="search-icon" />
                        </button>
                    </div>
                    <div className="menu-link">
                        <SlidersHorizontal size={25} />
                        <span className="label">Filter</span>

                    </div>
                </div>
                {/* <div className="menu">
                    <div className="menu-title">Links</div>
                    <Link to="/" className="menu-link">
                        <img src="/assets/images/settings.png" alt="icon" className="icon" />
                        <span className="label">Something</span>
                    </Link>
                    <Link to="/" className="menu-link">
                        <img src="/assets/images/settings.png" alt="icon" className="icon" />
                        <span className="label">Something</span>
                    </Link>
                </div> */}
            </div>
        </div>
    );
}

export default Sidebar;