import { getSessionState, recordDecision } from './storage.js';

function mapTextToScore(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("anticipatory")) return 5;
    if (lowerText.includes("strong")) return 4;
    if (lowerText.includes("adequate")) return 3;
    if (lowerText.includes("partial")) return 2;
    if (lowerText.includes("weak") || lowerText.includes("late")) return 1;
    if (lowerText.includes("harmful") || lowerText.includes("absent")) return 0;
    return 3;
}

export function processDecision(selectedOption, questionData) {
    const state = getSessionState();
    if (!state) return;

    const controlGain = selectedOption.controlGain || 0;
    
    for (const [pillar, impact] of Object.entries(selectedOption.sideEffects)) {
        if (state.act854Pillars[pillar] !== undefined) {
            let currentStress = state.act854Pillars[pillar];
            let newStress = currentStress + impact - (controlGain * 0.5);
            state.act854Pillars[pillar] = Math.max(0, Math.min(10, newStress));
        }
    }

    if (selectedOption.capabilityHints) {
        for (const [axis, hints] of Object.entries(selectedOption.capabilityHints)) {
            if (state.capabilityScores[axis] !== undefined) {
                const score = mapTextToScore(hints[0]);
                const prevScore = state.capabilityScores[axis];
                state.capabilityScores[axis] = prevScore === 0 ? score : (prevScore + score) / 2;
            }
        }
    }

    recordDecision({
        scenarioId: state.scenarioId,
        questionId: questionData.id,
        selectedOptionId: selectedOption.label,
        timestamp: new Date().toISOString(),
        consequence: selectedOption.consequenceText
    });

    updateDashboardUI(state);
}

function updateDashboardUI(state) {
    const getStatusHTML = (val) => {
        if (val >= 8) return `<span class="status status-critical">Critical</span>`;
        if (val >= 5) return `<span class="status status-high">Severe</span>`;
        if (val >= 3) return `<span class="status status-caution">Strained</span>`;
        return `<span class="status status-ok">Controlled</span>`;
    };

    const rightPanel = document.getElementById('pillar-list');
    if (rightPanel) {
        rightPanel.innerHTML = `
            <li>Security ${getStatusHTML(state.act854Pillars.security)}</li>
            <li>Defense ${getStatusHTML(state.act854Pillars.defence)}</li>
            <li>Foreign Relations ${getStatusHTML(state.act854Pillars.foreignRelations)}</li>
            <li>Economy ${getStatusHTML(state.act854Pillars.economy)}</li>
            <li>Public Health ${getStatusHTML(state.act854Pillars.publicHealth)}</li>
            <li>Public Safety ${getStatusHTML(state.act854Pillars.publicSafety)}</li>
            <li>Public Order ${getStatusHTML(state.act854Pillars.publicOrder)}</li>
            <li>Gov. Effectiveness ${getStatusHTML(state.act854Pillars.governmentEffectiveness)}</li>
        `;
    }
}
