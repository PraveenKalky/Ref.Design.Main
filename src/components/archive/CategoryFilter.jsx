import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import './filter-bar.css';

const categories = [
    { name: 'All', emoji: '' },
    { name: 'Productivity', emoji: '⚡' },
    { name: 'Health & Fitness', emoji: '🏃' },
    { name: 'Social Networking', emoji: '💬' },
    { name: 'Finance', emoji: '💰' },
    { name: 'Education', emoji: '🎓' },
    { name: 'Photo & Video', emoji: '📷' },
    { name: 'Lifestyle', emoji: '✨' },
    { name: 'Food & Drink', emoji: '🍔' },
    { name: 'News', emoji: '📰' },
    { name: 'Games', emoji: '🎮' },
    { name: 'Sports', emoji: '⚽' },
    { name: 'Utilities', emoji: '🛠️' },
    { name: 'Travel', emoji: '✈️' },
    { name: 'Graphics & Design', emoji: '🎨' },
    { name: 'Book', emoji: '📖' },
    { name: 'Weather', emoji: '☀️' },
    { name: 'Reference', emoji: '📚' },
    { name: 'Browser & AI', emoji: '🤖' }
];

const FilterBar = () => {
    const [activeTab, setActiveTab] = useState('popular');
    const [activeCategory, setActiveCategory] = useState('All');

    return (
        <div className="filter-bar-container">
            <div className="filter-bar-content">
                <div className="filter-tabs">
                    <button 
                        className={`filter-tab ${activeTab === 'latest' ? 'active' : ''}`}
                        onClick={() => setActiveTab('latest')}
                    >
                        Latest
                    </button>
                    <button 
                        className={`filter-tab ${activeTab === 'popular' ? 'active' : ''}`}
                        onClick={() => setActiveTab('popular')}
                    >
                        Most popular
                    </button>
                </div>
                <div className="filter-actions">
                    <button className="filter-btn">
                        <span>Filter</span>
                    </button>
                </div>
            </div>
            
            <div className="filter-categories-wrapper">
                <div className="filter-categories-scroll">
                    {categories.map((cat) => (
                        <button
                            key={cat.name}
                            className={`filter-chip ${activeCategory === cat.name ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.name)}
                        >
                            {cat.emoji && <span className="chip-emoji">{cat.emoji}</span>}
                            <span className="chip-label">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
