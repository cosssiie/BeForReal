import {Search, SlidersHorizontal, LogOut} from 'lucide-react';
import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import SearchModal from './SearchModal';

function Sidebar({isOpen, onLogout, onCategorySelect}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [categories, setCategories] = useState([]);
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

    const toggleFilters = () => {
        setShowFilters(prev => !prev);
    };

    const handleCategoryClick = (categoryId) => {
        onCategorySelect(categoryId); // передаємо вибір до HomePage
        setShowFilters(false); // ховаємо фільтри після вибору
    };

    useEffect(() => {
        axios.get('/api/categories')
            .then(res => {
                if (res.data && Array.isArray(res.data.categories)) {
                    setCategories(res.data.categories);
                }
            })
            .catch(err => {
                console.error('Failed to load categories:', err);
            });
    }, []);

    return (
        <>
            <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
                <div className="custom-sidebar">
                    <div className="menu" ref={searchRef}>
                        <div className="search-container" style={{position: 'relative'}}>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="search-input"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button className="search-button" onClick={handleSearch}>
                                <Search size={25} className="search-icon"/>
                            </button>
                        </div>

                        <div className="menu-link" onClick={toggleFilters} style={{cursor: 'pointer'}}>
                            <SlidersHorizontal size={25}/>
                            <span className="label">Filter</span>
                        </div>

                        {showFilters && (
                            <div className="filter-panel">
                                <div
                                    className="filter-option"
                                    onClick={() => handleCategoryClick(null)}
                                    style={{cursor: 'pointer', fontWeight: 'bold'}}
                                >
                                    Усі категорії
                                </div>
                                {categories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className="filter-option"
                                        onClick={() => handleCategoryClick(cat.id)}
                                        style={{cursor: 'pointer'}}
                                    >
                                        {cat.name}
                                    </div>
                                ))}
                            </div>
                        )}


                        <div className="logout-container">
                            <button className="logout-button" onClick={onLogout}>
                                <LogOut size={25}/>
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
