let recognition
let active=false
let continuousRestart=false

export function isSupported(){
    return typeof window!=='undefined'&&('webkitSpeechRecognition'in window||'SpeechRecognition'in window)
}

export function start(onResult,onEnd,onStart){
    if(!isSupported()){active=true;return}
    
    const R=window.SpeechRecognition||window.webkitSpeechRecognition
    recognition=new R()
    
    recognition.lang='en-US'
    recognition.interimResults=false
    recognition.maxAlternatives=1
    recognition.continuous=true
    
    continuousRestart=true
    active=true
    
    recognition.onstart=()=>{
        if(onStart)onStart()
    }

    recognition.onresult=e=>{
        const t=e.results[e.results.length-1][0].transcript
        if(onResult)onResult(t)
    }

    recognition.onerror=e=>{
        console.error('STT Error:', e.error)
    }

    recognition.onend=()=>{
        if(!continuousRestart||!active) return
        
        setTimeout(() => { 
            try{
                recognition.start()
            }catch(e){
                console.error('STT Restart failed:', e)
            }
        }, 100); 
    }

    try {
        recognition.start()
    } catch(e) {
        console.error('STT Start failed:', e)
        active=false
        if(onEnd)onEnd()
    }
}

export function stop(){
    if(!active)return
    
    continuousRestart=false
    active=false
    if(recognition){
        try{
            recognition.stop()
        }catch(e){
            console.error('STT Stop failed:', e)
        }
    }
}

export function isActive(){
    return active
}