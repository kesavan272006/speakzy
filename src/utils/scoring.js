
function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const cost = a[j - 1] === b[i - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,  
                matrix[i][j - 1] + 1,  
                matrix[i - 1][j - 1] + cost 
            );
        }
    }

    return matrix[b.length][a.length];
}

export function scorePronunciation(transcript, targetWords) {
    if (!transcript || !targetWords || targetWords.length === 0) {
        return { percent: 0, mistakes: [] };
    }

    const spokenWords = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const mistakes = [];
    let totalScore = 0;
    let wordsCounted = 0;
    const threshold = 0.7;

    for (const target of targetWords) {
        const targetLower = target.toLowerCase();
        let bestScore = 0;
        let bestSpokenWord = '';
        for (const spoken of spokenWords) {
            const distance = levenshteinDistance(targetLower, spoken);
            const accuracy = 1 - (distance / Math.max(targetLower.length, spoken.length));
            
            if (accuracy > bestScore) {
                bestScore = accuracy;
                bestSpokenWord = spoken;
            }
        }
        if (bestScore > 0) {
            wordsCounted++;
            totalScore += bestScore;

            if (bestScore < threshold) {
                mistakes.push({
                    word: target,
                    accuracy_score: bestScore,
                    phoneme_error: `Child said "${bestSpokenWord}" instead of "${target}".`
                });
            }
        }
    }

    const overallPercent = wordsCounted > 0 ? Math.round((totalScore / wordsCounted) * 100) : 0;

    return {
        percent: overallPercent,
        mistakes: mistakes.slice(0, 2)
    };
}