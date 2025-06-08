import { Search, SlidersHorizontal, LogOut } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SearchModal from './SearchModal'; // імпорт модального компонента

function Sidebar({ isOpen, onLogout }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef();


    const handleSearch = async () => {
        if (query.trim() === '') {
            setResults([]);
            setShowResults(false);
            return;
        }

        try {
            const res = await axios.get(`/api/users/search?q=${encodeURIComponent(query)}`);
            setResults(res.data);
            setShowResults(true);
        } catch (err) {
            console.error('Search error:', err);
        }
    };




    return (
        <>
            <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
                <div className="custom-sidebar">
                    <div className="menu" ref={searchRef}>
                        <div className="search-container" style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="search-input"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button className="search-button" onClick={handleSearch}>
                                <Search size={25} className="search-icon" />
                            </button>
                        </div>

                        <div className="menu-link">
                            <SlidersHorizontal size={25} />
                            <span className="label">Filter</span>
                        </div>

                        <div className="logout-container">
                            <button className="logout-button" onClick={onLogout}>
                                <LogOut size={25} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showResults && (
                <SearchModal
                    results={results}
                    onClose={() => setShowResults(false)}
                />
            )}
        </>
    );
}

export default Sidebar;
