// frontend/src/components/Navigation.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Navigation.css';

const navItems = [
    { name: 'Home', icon: '🏠', path: '/home' },
    { name: 'Practice', icon: '🏋️', path: '/practice' },
    { name: 'Leaderboard', icon: '🏆', path: '/leaderboard' },
    { name: 'Dictionary', icon: '📚', path: '/dictionary' },
    { name: 'Profile', icon: '👤', path: '/profile' },
];

const Navigation = ({ isSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const renderItem = (item) => (
        <div
            key={item.name}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
        >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.name}</span>
        </div>
    );

    if (isSidebar) {
        return (
            <nav className="sidebar-nav">
                <div className="sidebar-logo-space">
                    <span className="nav-icon large">🗣️</span>
                </div>
                {navItems.map(renderItem)}
            </nav>
        );
    } else {
        return (
            <nav className="bottom-navbar">
                {navItems.map(renderItem)}
            </nav>
        );
    }
};

export default Navigation;