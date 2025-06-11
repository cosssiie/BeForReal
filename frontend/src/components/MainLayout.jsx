import {useState} from 'react';
import {Outlet} from 'react-router-dom';
import Sidebar from './Sidebar';

function MainLayout({onLogout, user}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);


    const handleCategorySelect = (categoryId) => {
        setIsLoading(true);
        setSelectedCategory(categoryId);

        const url = categoryId
            ? `/api/posts/by_category?category_id=${categoryId}`
            : '/api/posts';

        fetch(url, {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to load filtered posts");
                return res.json();
            })
            .then(data => {
                setPosts(data.posts || data);
                setCurrentPage(1);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Error fetching filtered posts:", err);
                setPosts([]);
                setIsLoading(false);
            });
    };


    return (
        <div className="app-layout">
            <Sidebar
                isOpen={isSidebarOpen}
                onLogout={onLogout}
                user={user}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onCategorySelect={handleCategorySelect}
            />
            <div className="main-content">
                <Outlet context={{
                    posts,
                    setPosts,
                    isLoading,
                    setIsLoading,
                    currentPage,
                    setCurrentPage,
                    selectedCategory
                }}/>

            </div>
        </div>
    );
}

export default MainLayout;