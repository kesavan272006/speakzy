import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';

import { auth, database, googleprovider } from '../config/firebase'; 

import GooglePic from '../assets/googlePic.png';
import LoveVideo from '../assets/LittleGirlInLove.mp4';
import './SignInPage.css';

const SpeakzyLogoMini = () => (
    <div className="speakzy-logo-mini">
        Speakzy
    </div>
);

const SignInPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [isSigningUp, setIsSigningUp] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(database, "Users", user.uid);
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    navigate('/home');
                } 
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const addUser = async (uid, email) => {
        const userDocRef = doc(collection(database, "Users"), uid);

        try {
            const docSnap = await getDoc(userDocRef);
            if (!docSnap.exists()) {
                await setDoc(userDocRef, {
                    username: username,
                    email: email,
                    levelsCompleted: 0,
                    xp: 0
                });
            }
        } catch (err) {
            console.error("Error handling users: ", err);
        }
    };

    const signInWithGoogle = async () => {
        if (!username.trim()) {
            alert("Please enter a username for your Speakzy character!");
            return;
        }

        try {
            const result = await signInWithPopup(auth, googleprovider);
            const user = result.user;
            
            await addUser(user.uid, user.email); 
            
            const setupDocRef = doc(database, "Users", user.uid, "businessInfo", "data");
            const docSnap = await getDoc(setupDocRef);
            
            if (docSnap.exists()) {
                navigate('/home');
            } else {
                navigate("/signin");
            }

        } catch (error) {
            console.error("Error signing in with Google:", error.message);
            alert("Error signing in with Google. Please try again.");
        }
    };

    return (
        <div className="signin-page-speakzy">
            <header className="signin-header">
                <SpeakzyLogoMini />
            </header>

            <main className="signin-main-content">
                <h1 className="welcome-title">What's Your Character Name?</h1>
                
                <div className="character-display">
                    <video 
                        className="character-video"
                        src={LoveVideo}
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        alt="Little girl animated character"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div className="signin-card">
                    <div className="signin-form">
                        <div className="form-group">
                            <label htmlFor="username-input">Username</label>
                            <input
                                id="username-input"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="e.g., StarSpeaker, HappyKid"
                                required
                            />
                        </div>

                        <div className="divider-text">
                            <span>AND</span>
                        </div>
                        
                        <button 
                            type="button" 
                            onClick={signInWithGoogle}
                            className="google-signin-button"
                        >
                            <img className="google-icon" src={GooglePic} alt="Google" />
                            Sign in with Google
                        </button>
                    </div>
                </div>
            </main>

            <footer className="signin-footer">
                <p>&copy; 2025 Speakzy | Parentshala Internship Project</p>
            </footer>
        </div>
    );
};

export default SignInPage;