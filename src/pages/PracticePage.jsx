import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { start as sttStart, stop as sttStop, isActive as sttActive } from '../services/stt';
import { scorePronunciation } from '../utils/scoring';
import { speak as ttsSpeak } from '../services/tts';
import { PRACTICE_WORDS } from '../data/practiceWords';
import './PracticePage.css';

const DRILL_MODES = {
    WORD: 'Word Drill',
    PHRASE: 'Phrase Drill',
    SENTENCE: 'Sentence Drill'
};

const PracticePage = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState(DRILL_MODES.WORD);
    const [transcript, setTranscript] = useState('');
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [score, setScore] = useState(null); // {percent: 0, feedback: Array}
    const [isListening, setIsListening] = useState(false);
    const [sending, setSending] = useState(false);
        // Filter words based on the selected mode
    const filteredDrills = useMemo(() => {
        if (!PRACTICE_WORDS) return [];
        if (mode === DRILL_MODES.SENTENCE) {
            return PRACTICE_WORDS.filter(d => d.type === 'sentence');
        } else if (mode === DRILL_MODES.PHRASE) {
            return PRACTICE_WORDS.filter(d => d.type === 'phrase');
        }
        return PRACTICE_WORDS.filter(d => d.type === 'word');
    }, [mode]);

    const currentDrill = filteredDrills[currentWordIndex] || { text: 'Loading...', targets: [] };
    
    const playModel = () => {
        ttsSpeak(currentDrill.text, { rate: 0.9, gender: 'teacher' });
    };

    const handleResult = (text) => {
        setTranscript(text);
        
        // Instant scoring against target words
        const targetList = currentDrill.targets.length > 0 ? currentDrill.targets : [currentDrill.text];
        const newScore = scorePronunciation(text, targetList);
        setScore(newScore);
    };

    const toggleMic = () => {
        if (sttActive()) {
            sttStop();
            setIsListening(false);
            return;
        }
        
        setTranscript('');
        setScore(null);
        sttStart(handleResult, () => {
            setIsListening(false);
        }, () => {
            setIsListening(true);
        });
    };
    
    const nextDrill = () => {
        setCurrentWordIndex(prev => {
            if (prev < filteredDrills.length - 1) {
                return prev + 1;
            }
            return 0;
        });
        setTranscript('');
        setScore(null);
        sttStop();
    };

    // Reset index when mode changes
    useEffect(() => {
        setCurrentWordIndex(0);
    }, [mode]);
    
    const renderFeedback = () => {
        if (!score || score.mistakes.length === 0) {
            return <p className="feedback-text success">Great job! {score ? `${score.percent}% accuracy.` : 'Ready to start!'}</p>;
        }
        
        return (
            <div className="feedback-container">
                <p className="feedback-text fail">Needs practice! {score.percent}% accuracy.</p>
                <ul className="mistake-list">
                    {score.mistakes.map((m, i) => (
                        <li key={i}>
                            <span className="mistake-word">{m.word}:</span> {m.phoneme_error}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };


    return (
        <div className="practice-page-wrap">
            <header className="practice-header">
                <button className="back-btn" onClick={() => navigate('/home')}>🏠 Map</button>
                <h1 className="practice-title">🗣️ Phonetics Drill Lab</h1>
                <div className="practice-stats">
                    <span className="badge">XP: ---</span>
                </div>
            </header>

            <section className="drill-mode-selector">
                {Object.values(DRILL_MODES).map(m => (
                    <button
                        key={m}
                        className={`mode-btn ${mode === m ? 'active' : ''}`}
                        onClick={() => setMode(m)}
                    >
                        {m}
                    </button>
                ))}
            </section>

            <main className="drill-card">
                <div className="drill-prompt">
                    <p className="drill-instruction">Read this {mode.toLowerCase()} out loud:</p>
                    <div className="drill-display-box">
                        <span className="current-drill-text">{currentDrill.text}</span>
                        <button className="play-btn" onClick={playModel}>🔊</button>
                    </div>
                </div>

                <div className="drill-feedback-area">
                    {score !== null && renderFeedback()}
                    <div className={`transcript-display ${isListening ? 'listening' : ''}`}>
                        {transcript || (isListening ? "Listening closely..." : "Press SPEAK to start.")}
                    </div>
                </div>
                
                <div className="mic-controls">
                    <button 
                        className={`mic-btn ${isListening ? 'rec' : 'listen'}`} 
                        onClick={toggleMic}
                        disabled={!currentDrill.text || filteredDrills.length === 0 || isListening && sending}
                    >
                        {isListening ? 'STOP' : 'SPEAK'}
                    </button>
                    <button className="next-btn" onClick={nextDrill} disabled={isListening}>
                        Next Drill ➡️
                    </button>
                </div>
            </main>
        </div>
    );
};

export default PracticePage;