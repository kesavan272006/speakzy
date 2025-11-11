import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DICTIONARY_WORDS } from '../data/dictionaryData';
import { speak as ttsSpeak } from '../services/tts'; 
import './DictionaryPage.css';

const DictionaryPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredWords = useMemo(() => {
        if (!searchTerm) {
            return DICTIONARY_WORDS;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        return DICTIONARY_WORDS.filter(item => 
            item.word.toLowerCase().includes(lowerCaseSearch)
        );
    }, [searchTerm]);

    const handlePronounce = (text) => {
        ttsSpeak(text, { rate: 0.9, gender: 'male' });
    };

    return (
        <div className="dictionary-wrap">
            <header className="dictionary-header">
                <button className="back-btn" onClick={() => navigate('/home')}>🏠 Map</button>
                <h1 className="dictionary-title">📚 Speakzy Dictionary</h1>
            </header>

            <main className="dictionary-main">
                <div className="search-box-container">
                    <input
                        type="text"
                        placeholder="Search for a word..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="word-list-container">
                    {filteredWords.length > 0 ? (
                        filteredWords.map((item, index) => (
                            <div key={index} className="word-entry-card">
                                <div className="word-details">
                                    <h2 className="word-title">{item.word}</h2>
                                    <span className="word-ipa">/{item.ipa}/</span>
                                    <p className="word-example">"{item.example}"</p>
                                </div>
                                <button 
                                    className="pronounce-btn" 
                                    onClick={() => handlePronounce(item.word)}
                                >
                                    🔊
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="no-results">No words match your search. Try another!</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DictionaryPage;