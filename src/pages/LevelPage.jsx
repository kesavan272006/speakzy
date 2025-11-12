import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import { LEVELS } from '../data/levels';
import { start as sttStart, stop as sttStop, isActive as sttActive } from '../services/stt';
import { speak as ttsSpeak, stop as ttsStop, isSpeaking as ttsIsSpeaking } from '../services/tts';
import { generateNpcPrompt, askNpc } from '../services/llm';
import { scorePronunciation } from '../utils/scoring';
import './LevelPage.css';

const inferGender = (name) => {
    const femaleNames = ['Mom', 'Grandma', 'Teacher'];
    const maleNames = ['Shopkeeper', 'Doctor', 'Friend', 'Classroom'];
    if (femaleNames.some(n => name.includes(n))) return 'female';
    if (maleNames.some(n => name.includes(n))) return 'male';
    return 'male'; 
};

export default function LevelPage({ fixedLevelId, videoSrc }){
    const { id } = useParams();
    const navigate = useNavigate();
    const targetId = fixedLevelId || id;
    const level = useMemo(()=>LEVELS.find(l=>String(l.id)===String(targetId))||LEVELS[0],[targetId]);
    
    const [uid, setUid] = useState(null);
    const [userData, setUserData] = useState({ name: 'Speaker', age: 4 });
    const [transcript, setTranscript] = useState('');
    const [score, setScore] = useState({ percent: 0, mistakes: [] });
    const [chat, setChat] = useState([]);
    const [sending, setSending] = useState(false);
    const [seconds, setSeconds] = useState(180);
    const [running, setRunning] = useState(false);
    const [talking, setTalking] = useState(false);
    const [correctionTip, setCorrectionTip] = useState(null);
    const [isAwaitingStart, setIsAwaitingStart] = useState(true);
    const npcGender = useMemo(() => inferGender(level.npc.name), [level.npc.name]);

    useEffect(()=>{
        const un=onAuthStateChanged(auth,async (u)=>{
            if(!u){navigate('/signin');return}
            setUid(u.uid);
            
            const userDocRef = doc(database, "Users", u.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                setUserData({ name: userSnap.data().username || u.displayName || 'Speaker', age: 4 });
            }
        });
        return()=>un&&un()
    },[navigate])

    useEffect(()=>{
        setTranscript('');
        setScore({percent:0,mistakes:[]});
        setChat([]);
        setSeconds(180);
        setRunning(false);
        setCorrectionTip(null);
        setIsAwaitingStart(true);
    },[level]);
    
    useEffect(()=>{
        if (isAwaitingStart) {
            const greeting = `Hi, I am ${level.npc.name}. ${level.setting}. Press 'START CONVERSATION' to begin!`;
            setChat([{role:'npc',text:greeting}]);
            setRunning(true);
        }
    }, [isAwaitingStart, level]);

    function handleResult(text){
        setTranscript(text);
    }
    
    function toggleMic(){
        if(sttActive()){
            sttStop();
            return;
        }
        
        if(isAwaitingStart) {
            const greeting = chat[0]?.text || `Hello! Let's start.`;
            
            ttsSpeak(greeting,{rate:0.95,pitch:1, gender: npcGender});
            
            setTimeout(() => {
                ttsStop();
                setTranscript('');
                sttStart(handleResult, () => {});
                setIsAwaitingStart(false);
            }, 1500); 
            return;
        }

        ttsStop(); 
        setTranscript('');
        sttStart(handleResult, ()=>{});
    }


    async function startRoleplay(){
        setRunning(true);
        setSending(true);
        setSending(false);
    }

    async function sendToNpc(){
        if(!transcript.trim())return;
        
        const currentScore = scorePronunciation(transcript, level.targets.words);
        
        const userTurn = {role:'user',text:transcript}
        setChat(c=>[...c,userTurn])
        setSending(true)
        setCorrectionTip(null);

        sttStop();
        
        try{
            const promptConfig = generateNpcPrompt(level, transcript, currentScore.mistakes, chat, userData);
            
            const reply = await askNpc(promptConfig);
            
            setChat(c=>[...c,{role:'npc',text:reply.npc_reply}])
            ttsSpeak(reply.npc_reply,{rate:0.95,pitch:1, gender: npcGender})
            
            if(reply.focus_word && reply.correction_tip) {
                 setCorrectionTip(`Focus on "${reply.focus_word}": ${reply.correction_tip}`);
            } else {
                 setCorrectionTip(null);
            }
            
            setTranscript('');
            setScore(currentScore);

            if (reply.status !== 'CONTINUES') {
                setRunning(false);
            }

        }catch(e){
            console.error("LLM Conversation Error:", e);
            setChat(c=>[...c,{role:'npc',text:"Oops! I had trouble hearing you. Can you try that phrase one more time?"}])
        }finally{
            setSending(false)
        }
    }


    async function completeLevel(){
        try{
            if(!uid)return;
            const progressRef=doc(database,'Users',uid,'progressInfo','current');
            const snap=await getDoc(progressRef);
            const current=snap.exists()?snap.data():{highestLevel:0,totalXP:0};
            
            const passed = score.percent >= level.goal; 
            const newHighest = passed ? Math.max(current.highestLevel||0, level.id) : current.highestLevel||0;
            const xpGain = passed ? Math.max(10, Math.round(score.percent/2)) : 5;
            
            const payload={highestLevel:newHighest, totalXP:(current.totalXP||0)+xpGain};
            
            if(snap.exists()) await updateDoc(progressRef,payload);
            else await setDoc(progressRef,payload);
        }catch(e){
            console.error("Error updating progress:", e);
        }
        ttsStop(); 
        navigate('/home')
    }
    useEffect(()=>{if(!running)return;const t=setInterval(()=>{setSeconds(s=>{if(s<=1){clearInterval(t);setRunning(false);return 0}return s-1})},1000);return()=>clearInterval(t)},[running])
    const mm=Math.floor(seconds/60).toString().padStart(2,'0')
    const ss=Math.floor(seconds%60).toString().padStart(2,'0')

    useEffect(()=>{
        const id=setInterval(()=>{setTalking(ttsIsSpeaking())},300)
        return()=>clearInterval(id)
    },[])
    
    return (
        <div className="level-wrap">
            <header className="level-header">
                <button className="back-btn" onClick={()=>navigate(-1)}>🏠 Back to Map</button>
                <div className="level-title-main">Level {level.id} • {level.title}</div>
                <div className="level-stats">
                    <div className="badge goal-badge">🎯 Goal: {level.goal}%</div>
                    <div className="badge diff-badge">🌟 Diff: {level.difficulty}</div>
                </div>
            </header>

            <section className="level-card">
                <div className="card-body">
                    <div className="chat">
                        
                        <div className="npc-video">
                            {videoSrc ? (
                                String(videoSrc).match(/\.(mp4|webm|mov)$/i) ? (
                                    <video className={`npc-video-el ${talking?'talking':''}`} src={videoSrc} autoPlay loop muted playsInline />
                                ) : (
                                    <img className={`npc-video-el ${talking?'talking':''}`} src={videoSrc} alt="NPC" />
                                )
                            ) : (
                                <div className={`npc-video-el ${talking?'talking':''}`} style={{display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800}}>NPC</div>
                            )}
                            <div className="timer">{mm}:{ss}</div>
                        </div>
                        
                        <div className="bubbles">
                            {chat.map((m,i)=>(
                                <div key={i} className={`bubble ${m.role==='npc'?'npc':'user'}`}>
                                    {m.text}
                                </div>
                            ))}
                            {sending && <div className="typing-indicator bubble npc">...is thinking</div>}
                        </div>

                        {correctionTip && (
                            <div className="correction-tip-box">
                                💡 Try This: {correctionTip}
                                <span className="close-tip" onClick={() => setCorrectionTip(null)}>X</span>
                            </div>
                        )}

                        <div className="mic-box">
                            <button className={`mic-btn ${sttActive()?'rec':'listen'}`} onClick={toggleMic}>
                                {sttActive()? 'STOP LISTENING': (isAwaitingStart ? 'START CONVERSATION' : 'SPEAK')}
                            </button>
                            <div className="transcript-container">
                                <span className="transcript-label">Your words:</span>
                                <div className="transcript-text">{transcript || (sttActive() ? "Listening closely..." : "Speak now...")}</div>
                            </div>
                            <div className="action-buttons">
                                <button className="secondary" onClick={()=>{ttsStop();setTranscript('')}}>Clear</button>
                                <button className="primary" disabled={sending||!transcript.trim()||sttActive()||isAwaitingStart} onClick={sendToNpc}>
                                    {sending?'SENDING...':'SEND ANSWER'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="footer">
                    <button className="secondary" onClick={()=>{ttsStop();setTranscript('');setChat([]);setIsAwaitingStart(true);}}>Restart Level</button>
                    <div className="current-score-display">
                        Accuracy: <span className="score-percent" style={{color: score.percent >= level.goal ? '#47ff8a' : '#ffd166'}}>{score.percent}%</span>
                    </div>
                    <button className="primary finish-btn" onClick={completeLevel}>FINISH & SAVE</button>
                </div>
            </section>
        </div>
    );
}