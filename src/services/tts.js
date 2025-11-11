let speaking=false
let cachedVoices=null

function loadVoices(){
    if(typeof window==='undefined'||!('speechSynthesis'in window)) return []
    const synth=window.speechSynthesis
    let voices=synth.getVoices()
    if(!voices||voices.length===0){
        synth.onvoiceschanged=()=>{cachedVoices=synth.getVoices()}
        voices=synth.getVoices()
    }
    cachedVoices=voices
    return voices||[]
}

function pickBestVoice(desiredGender){
    const voices=cachedVoices||loadVoices()
    if(!voices||voices.length===0) return null
    
    let preferredVoices = voices.filter(v => /^en(-|_)/i.test(v.lang))
    
    if (desiredGender) {
        const targetGender = desiredGender.toLowerCase();
        const genderFiltered = preferredVoices.filter(v => {
            const nameLower = v.name.toLowerCase();
            if (targetGender === 'female' || targetGender === 'woman') {
                return nameLower.includes('female') || nameLower.includes('femenino') || nameLower.includes('aria') || nameLower.includes('samantha') || nameLower.includes('eva');
            } else if (targetGender === 'male' || targetGender === 'man') {
                return nameLower.includes('male') || nameLower.includes('masculino') || nameLower.includes('guy') || nameLower.includes('david') || nameLower.includes('zira');
            }
            return false;
        });

        if (genderFiltered.length > 0) {
            return genderFiltered[0];
        }
    }
    return preferredVoices[0] || voices[0]
}

export function speak(text,opts={}){
    if(typeof window==='undefined'||!('speechSynthesis'in window))return
    
    const u=new SpeechSynthesisUtterance(text)
    const voice=pickBestVoice(opts.gender)
    
    if(voice) u.voice=voice
    
    u.lang=opts.lang || (voice?.lang||'en-US')
    if(opts.rate)u.rate=opts.rate
    if(opts.pitch)u.pitch=opts.pitch
    
    speaking=true
    u.onend=()=>{speaking=false}
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
}

export function isSpeaking(){return speaking}
export function stop(){if(typeof window==='undefined')return;window.speechSynthesis.cancel();speaking=false}