import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import './ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [newUsername, setNewUsername] = useState('');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/signin');
                return;
            }
            
            const fetchProfile = async () => {
                setLoading(true);
                const userDocRef = doc(database, "Users", user.uid);
                const progressDocRef = doc(userDocRef, "progressInfo", "current");
                
                try {
                    const userSnap = await getDoc(userDocRef);
                    const progressSnap = await getDoc(progressDocRef);
                    
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        const progressData = progressSnap.exists() ? progressSnap.data() : { highestLevel: 0, totalXP: 0 };
                        
                        const profile = {
                            email: user.email,
                            currentUsername: userData.username || user.displayName || 'Player',
                            xp: progressData.totalXP || 0,
                            levelsCompleted: progressData.highestLevel || 0,
                        };
                        
                        setUserProfile(profile);
                        setNewUsername(profile.currentUsername);
                    }
                } catch (error) {
                    console.error("Error fetching profile data:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchProfile();
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleUpdateUsername = async (e) => {
        e.preventDefault();
        if (!auth.currentUser || !newUsername.trim()) {
            setMessage('Username cannot be empty.');
            return;
        }

        const userDocRef = doc(database, "Users", auth.currentUser.uid);
        
        try {
            await updateDoc(userDocRef, {
                username: newUsername.trim(),
            });
            setUserProfile(prev => ({ ...prev, currentUsername: newUsername.trim() }));
            setIsEditing(false);
            setMessage('✅ Username updated successfully!');
        } catch (error) {
            console.error("Error updating username:", error);
            setMessage('❌ Failed to update username. Try again.');
        }
    }
    
    if (loading || !userProfile) {
        return (
             <div className="loading-screen">
                <div className="loading-spinner"></div>
                <div className="loading-bar">
                    <div></div> 
                </div>
                <div className="loading-text">Loading Profile...</div>
            </div>
        );
    }

    return (
        <div className="profile-wrap">
            <header className="profile-header">
                <button className="back-btn" onClick={() => navigate('/home')}>🏠 Map</button>
                <h1 className="profile-title">👤 My Speakzy Profile</h1>
            </header>

            <main className="profile-main-card">
                <div className="avatar-section">
                    <div className="profile-avatar">
                        {userProfile.currentUsername.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="current-username">{userProfile.currentUsername}</h2>
                    <p className="user-email-display">{userProfile.email}</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-box">
                        <span className="stat-value">{userProfile.xp}</span>
                        <span className="stat-label">Total XP 💎</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value">{userProfile.levelsCompleted}</span>
                        <span className="stat-label">Levels Completed ⭐</span>
                    </div>
                </div>

                <div className="edit-section">
                    <h3>Game Settings</h3>
                    
                    {message && <p className={`message-display ${message.startsWith('✅') ? 'success' : 'error'}`}>{message}</p>}

                    {!isEditing ? (
                        <button className="primary-edit-btn" onClick={() => setIsEditing(true)}>
                            Edit Username
                        </button>
                    ) : (
                        <form onSubmit={handleUpdateUsername} className="edit-form">
                            <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="New Username"
                                className="username-input"
                                maxLength={20}
                                required
                            />
                            <div className="form-actions">
                                <button type="button" className="secondary-cancel-btn" onClick={() => {setIsEditing(false); setNewUsername(userProfile.currentUsername); setMessage('');}}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary-save-btn">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;