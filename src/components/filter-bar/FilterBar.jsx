import React, { useState } from 'react';
import { SlidersHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
import CategoryFilterExpanded from '../filters/CategoryFilterExpanded';
import './filter-bar.css';



const FilterBar = () => {
    const [activeTab, setActiveTab] = useState('popular');
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="filter-bar-container">
            <div className="filter-bar-content">
                <div className="filter-tabs">
                    <button 
                        className={`collapse-btn ${isExpanded ? 'active' : ''}`}
                        onClick={() => setIsExpanded(!isExpanded)}
                        title={isExpanded ? "Collapse" : "Expand"}
                    >
                        <ChevronDown size={16} strokeWidth={3} className="arrow-icon" />
                    </button>
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
            
            <div className={`filter-categories-wrapper ${isExpanded ? 'expanded' : ''}`}>
                <div className="filter-categories-inner">
                    <CategoryFilterExpanded />
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
