import React, { useState } from 'react';
import { SlidersHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
import CategoryFilterExpanded from '../filters/CategoryFilterExpanded';
import './filter-bar.css';



const FilterBar = ({ 
    tabs = [
        { id: 'latest', label: 'Latest' },
        { id: 'popular', label: 'Most popular' }
    ],
    defaultActiveTab = 'popular',
    rightElement = (
        <button className="filter-btn">
            <span>Filter</span>
        </button>
    )
}) => {
    const [activeTab, setActiveTab] = useState(defaultActiveTab);
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
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            className={`filter-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (!isExpanded) setIsExpanded(true);
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="filter-actions">
                    {rightElement}
                </div>
            </div>
            
            <div className={`filter-categories-wrapper ${isExpanded ? 'expanded' : ''}`}>
                <div className="filter-categories-inner">
                    <CategoryFilterExpanded activeTab={activeTab} tabs={tabs} />
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
