import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';

import { auth, database } from '../config/firebase'; 
import Navigation from '../components/Navigation';
import './HomePage.css'; 

const ALL_LEVELS_DATA = [
    { id: 1, title: 'Home Chat', description: 'Talk to your parents', path: '/levels/1', icon: '🏠', status: 'unlocked' },
    { id: 2, title: 'Playground Friend', description: 'Invite a friend to play', path: '/levels/2', icon: '🧒', status: 'locked' },
    { id: 3, title: 'Classroom Qs', description: 'Ask the teacher a question', path: '/levels/3', icon: '🏫', status: 'locked' },
    { id: 4, title: 'Store Helper', description: 'Buy items from the shop', path: '/levels/4', icon: '🛒', status: 'locked' },
    { id: 5, title: 'Telephone Call', description: 'Call Grandma to say hello', path: '/levels/5', icon: '📞', status: 'locked' },
];

const SpeakzyHeaderLogo = () => (
    <div className="speakzy-header-logo">
        <span style={{color: 'var(--color-accent)'}}>Speakzy</span>
    </div>
);


const HomePage = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [levels, setLevels] = useState(ALL_LEVELS_DATA);
    const [loading, setLoading] = useState(true);
    
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 900);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth > 900);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate('/signin');
                return;
            }

            const fetchUserData = async () => {
                const userDocRef = doc(database, "Users", user.uid);
                const progressDocRef = doc(userDocRef, "progressInfo", "current");
                
                try {
                    const userSnap = await getDoc(userDocRef);
                    const progressSnap = await getDoc(progressDocRef);
                    
                    if (userSnap.exists()) {
                        const userDbData = userSnap.data();
                        const progressDbData = progressSnap.exists() ? progressSnap.data() : { highestLevel: 0, totalXP: 0 };
                        
                        const mergedData = { 
                            name: userDbData.username || user.displayName || 'Speaker',
                            xp: progressDbData.totalXP,
                            highestLevel: progressDbData.highestLevel || 0
                        };
                        setUserData(mergedData);
                        updateLevelStatuses(mergedData.highestLevel);
                    } else {
                        console.error("User data missing in Firestore /Users.");
                        navigate('/welcome');
                    }
                } catch (error) {
                    console.error("Error fetching user data or progress:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchUserData();
        });

        return () => unsubscribeAuth();
    }, [navigate]);

    const updateLevelStatuses = (highestLevel) => {
        const updatedLevels = ALL_LEVELS_DATA.map(level => {
            let status = 'locked';
            if (level.id <= highestLevel + 1) { 
                status = 'unlocked';
            }
            if (level.id <= highestLevel) { 
                 status = 'completed';
            }
            return { ...level, status };
        });
        setLevels(updatedLevels);
    };

    const handleLevelClick = (level) => {
        if (level.status === 'unlocked' || level.status === 'completed') {
            navigate(level.path);
        } else {
            alert(`Level ${level.id} is locked! Complete ${ALL_LEVELS_DATA[level.id - 2]?.title || 'previous levels'} first.`);
        }
    };

    if (loading || !userData) {
        return (
             <div className="loading-screen">
                <div className="loading-spinner"></div>
                <div className="loading-bar">
                    <div></div> 
                </div>
                <div className="loading-text">Starting Speakzy Adventure...</div>
            </div>
        );
    }

    return (
        <div className={`home-page ${isDesktop ? 'has-sidebar' : ''}`}>
            
            {/* Navigation Component */}
            <Navigation isSidebar={isDesktop} />

            <div className="main-content-wrapper">

                <main className="levels-map-container">
                    
                    <div className="section-banner">
                        <span className="section-title">LEVELS 1-5: Daily Dialogues</span>
                        <div className="list-icon">☰</div>
                    </div>

                    <div className="levels-path">
                        {levels.map((level, index) => (
                            <React.Fragment key={level.id}>
                                <div 
                                    className={`level-node ${level.status} level-${level.id}`}
                                    onClick={() => handleLevelClick(level)}
                                >
                                    <div className="level-icon-wrapper">
                                        <div className="level-icon">{level.icon}</div>
                                    </div>
                                    <span style={{marginTop:'200px'}} className="level-title">{level.title}</span>
                                </div>
                                {index < levels.length - 1 && (
                                    <div className={`path-line ${levels[index + 1].status !== 'locked' ? 'unlocked' : 'locked'}`}></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default HomePage;