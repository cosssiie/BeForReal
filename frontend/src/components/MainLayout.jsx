import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function MainLayout({ onLogout, user }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="app-layout">
            <Sidebar
                isOpen={isSidebarOpen}
                onLogout={onLogout}
                user={user}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
}

export default MainLayout;