const GEMINI_MODEL = 'gemini-2.5-flash-preview-09-2025';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""; 

export function generateNpcPrompt(level, userTranscript, mistakes, chatHistory, userData = { name: 'Speaker', age: 4 }) {
    
    const systemPersona = `
        You are ${level.npc.name}, a friendly, patient speech coach acting as a ${level.npc.style} NPC for a young child (${userData.age} years old) named ${userData.name}.
        Your role is to maintain a continuous, short conversation about the setting: "${level.setting}".

        MANDATORY RULES:
        1. Keep ALL replies extremely short (max 2 sentences, max 15 words per turn).
        2. Tone must be playful, encouraging, gentle, and age-appropriate (2-5 year old vocabulary).
        3. IF MISTAKES EXIST: You MUST acknowledge the mistake (use the focus_word), give one simple, actionable tip (max 5 words), and then pivot back to the conversation.
        4. IF NO MISTAKES EXIST: Generate a purely conversational follow-up question/comment to keep the roleplay flowing.
        5. Your final output MUST be a single, valid JSON object, and nothing else.
    `;

    const mistakeSummary = mistakes && mistakes.length > 0
        ? mistakes.map(m => `ERROR: Word "${m.word}". Phonetic issue: ${m.phoneme_error || 'unspecified mistake'}.`).join(' ')
        : 'NONE. The child spoke clearly.';

    const userQuery = `
        --- LATEST TURN ANALYSIS ---
        Child's Transcript: "${userTranscript}"
        Target Words for Level: ${level.targets.words.join(', ')}
        Pronunciation Analysis Result: ${mistakeSummary}
        
        --- TASK ---
        1. Generate your conversational reply (npc_reply) based on the analysis and context.
        2. If a mistake exists, identify the single most critical "focus_word" to correct.
        3. If a mistake exists, provide one simple "correction_tip" (e.g., "Pinch your lips" or "Say it slowly").
        
        Output JSON:
    `;

    const contents = [];
    
    contents.push({ role: "user", parts: [{ text: systemPersona }] });
    
    if (chatHistory && chatHistory.length > 0) {
        contents.push(...chatHistory.map(m => ({
            role: m.role === 'npc' ? 'model' : 'user', 
            parts: [{ text: m.text }]
        })));
    }

    contents.push({ role: "user", parts: [{ text: userQuery }] });


    return {
        contents,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "object",
                properties: {
                    npc_reply: { type: "string", description: "The short, conversational reply to the child (max 15 words)." },
                    focus_word: { type: "string", description: "The target word the child needs to practice, or null if no major error." },
                    correction_tip: { type: "string", description: "A simple, actionable tip for the correction (max 5 words), or null if no correction is needed." },
                    status: { type: "string", enum: ["CONTINUES", "END_GOAL_MET", "END_TIME_UP"], description: "Indicates the conversation state." }
                },
                required: ["npc_reply", "status"]
            },
            temperature: 0.8, 
        }
    };
}

export async function askNpc(promptConfig) {
    if (!GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is not set. Returning mock response.");
        return {
            npc_reply: "Oops! I need a moment to think. Let's try again.",
            focus_word: null,
            correction_tip: null,
            status: "CONTINUES"
        };
    }

    const MAX_RETRIES = 3;
    const body = JSON.stringify({
        contents: promptConfig.contents,
        generationConfig: promptConfig.config,
    });
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(`${ENDPOINT}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API returned status ${response.status}: ${errorData?.error?.message || 'Unknown error'}`);
            }

            const result = await response.json();
            const candidate = result.candidates?.[0];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                const jsonText = candidate.content.parts[0].text;
                try {
                    return JSON.parse(jsonText);
                } catch (e) {
                    console.error("LLM returned non-JSON text:", jsonText);
                    return { npc_reply: "My robot ears couldn't quite understand that. Can you say it clearly?", focus_word: null, correction_tip: null, status: "CONTINUES" };
                }
            }
            
            throw new Error("API response lacked candidates or text part.");

        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed:`, error.message);
            if (attempt === MAX_RETRIES - 1) {
                return { npc_reply: "Oh dear! I need to rest my circuits. Let's finish later.", focus_word: null, correction_tip: null, status: "CONTINUES" };
            }
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }
}