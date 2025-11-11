import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
    const navigate = useNavigate();
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/signin');
                return;
            }
        });

        const fetchLeaderboard = async () => {
            setLoading(true);
            const usersRef = collection(database, "Users");
            let results = [];

            try {
                const usersSnapshot = await getDocs(usersRef);

                for (const userDoc of usersSnapshot.docs) {
                    const userData = userDoc.data();
                    const userId = userDoc.id;

                    const progressRef = doc(userDoc.ref, "progressInfo", "current");
                    const progressSnap = await getDoc(progressRef);
                    const progressData = progressSnap.exists() ? progressSnap.data() : { highestLevel: 0, totalXP: 0 };
                    
                    if (userData.username) {
                         results.push({
                            id: userId,
                            rank: 0,
                            name: userData.username,
                            email: userData.email || 'N/A',
                            levels: progressData.highestLevel || 0,
                            xp: progressData.totalXP || 0,
                        });
                    }
                }

                results.sort((a, b) => {
                    if (b.levels !== a.levels) {
                        return b.levels - a.levels;
                    }
                    return b.xp - a.xp;
                });
                
                const finalData = results.map((item, index) => ({
                    ...item,
                    rank: index + 1
                }));

                setLeaderboardData(finalData);

            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
        return () => unsubscribe();
    }, [navigate]);

    const getMedal = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    if (loading) {
        return (
             <div className="loading-screen">
                <div className="loading-spinner"></div>
                <div className="loading-bar">
                    <div></div> 
                </div>
                <div className="loading-text">Loading Leaderboard...</div>
            </div>
        );
    }

    return (
        <div className="leaderboard-wrap">
            <header className="leaderboard-header">
                <button className="back-btn" onClick={() => navigate('/home')}>🏠 Map</button>
                <h1 className="leaderboard-title">Top Speakers Leaderboard</h1>
            </header>

            <main className="leaderboard-card">
                <div className="leaderboard-header-row">
                    <div className="rank-col">Rank</div>
                    <div className="name-col">Name</div>
                    <div className="levels-col">Levels</div>
                </div>

                <div className="leaderboard-list">
                    {leaderboardData.map((player) => (
                        <div key={player.id} className="player-row">
                            <div className="rank-col">
                                <span className={`medal rank-${player.rank}`}>{getMedal(player.rank)}</span>
                            </div>
                            <div className="name-col">
                                <span className="player-name">{player.name}</span>
                                <span className="player-email">{player.email}</span>
                            </div>
                            <div className="levels-col">
                                <span className="player-levels">{player.levels}</span>
                                <span className="player-xp">{player.xp} XP</span>
                            </div>
                        </div>
                    ))}
                    {leaderboardData.length === 0 && <p className="no-data">No players found yet. Be the first!</p>}
                </div>
            </main>
        </div>
    );
};

export default LeaderboardPage;