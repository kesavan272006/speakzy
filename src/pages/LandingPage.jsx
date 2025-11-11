import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThumbsUpVideo from '../assets/Littlegirlwiththumbsup.mp4';
import './LandingPage.css'; 
const SpeakzyLogo = () => (
    <div style={{ 
        fontSize: '4rem', 
        fontWeight: 900, 
        color: 'var(--color-accent)', 
        textShadow: '3px 3px 0 var(--color-secondary)' 
    }}>
        Speakzy
    </div>
);

const LandingPage = () => {
    const navigate = useNavigate();

    const handleStartClick = () => {
        navigate('/signin'); 
    };

    return (
        <div className="landing-page">
            <header className="landing-header">
                <SpeakzyLogo />
            </header>

            <main className="landing-content">
                <div className="content-left">
                    <h1 className="main-title">
                        Speak Smart. <br />
                        Play Bright.
                    </h1>
                    <p className="subtitle">
                        The fun, AI-powered game that helps your child master pronunciation and confidence through real-life roleplay scenarios.
                    </p>
                    
                    <ul className="feature-list">
                        <li>★ Level-based Learning</li>
                        <li>★ Personalized LLM Feedback</li>
                        <li>★ Real-life Dialogues</li>
                        <li>★ Progress Tracking</li>
                    </ul>

                    <button className="cta-button" onClick={handleStartClick}>
                        Start Your Adventure!
                    </button>
                </div>
                
                <div className="content-right">
                    <video 
                        className="hero-video"
                        src={ThumbsUpVideo}
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            </main>

            <footer className="landing-footer">
                <p>&copy; 2025 Speakzy | Parentshala Internship Project</p>
            </footer>
        </div>
    );
};

export default LandingPage;