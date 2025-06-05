import { Search, SlidersHorizontal, LogOut } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar({ isOpen, onLogout }) {
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
                    <div className="logout-container">
                        <button
                            className="logout-button"
                            onClick={onLogout}
                        >
                            <LogOut size={25} />
                        </button>
                    </div>
                </div>


            </div>
        </div>
    );
}

export default Sidebar;