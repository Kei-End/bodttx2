import { getSessionState, initSession, saveSessionState } from './storage.js';
import { processDecision } from './scoring.js';
import { renderFinalDebrief } from './charts.js';

let currentScenarioData = null;
let currentlySelectedOption = null;

export async function loadScenario(scenarioFileName) {
    try {
        const response = await fetch(`./scenarios/${scenarioFileName}`);
        currentScenarioData = await response.json();
        renderCurrentQuestion();
    } catch (error) {
        console.error("Failed to load scenario JSON:", error);
    }
}

export function renderCurrentQuestion() {
    const state = getSessionState();
    if (!state || !currentScenarioData) return;

    const questionIndex = state.currentPhaseIndex;
    if (questionIndex >= currentScenarioData.questions.length) {
        renderFinalDebrief();
        return;
    }

    const questionData = currentScenarioData.questions[questionIndex];
    const promptContainer = document.getElementById('scenario-prompt-container');
    const promptText = document.getElementById('scenario-prompt');
    const optionsContainer = document.getElementById('options-container');
    const actionBtn = document.getElementById('action-btn');
    const phaseTracker = document.getElementById('phase-tracker');

    phaseTracker.innerText = `Phase ${questionIndex + 1} of ${currentScenarioData.questions.length}`;

    const isWildcard = questionData.prompt.toUpperCase().includes("WILDCARD");
    if (isWildcard) {
        promptContainer.classList.add('wildcard-active');
        promptText.innerHTML = `<strong>WILDCARD:</strong> ${questionData.prompt.replace(/WILDCARD:\s*/i, '')}`;
    } else {
        promptContainer.classList.remove('wildcard-active');
        promptText.textContent = questionData.prompt;
    }

    optionsContainer.innerHTML = '';
    currentlySelectedOption = null;
    
    questionData.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-card';
        btn.textContent = option.label;
        btn.onclick = () => {
            document.querySelectorAll('.option-card').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            currentlySelectedOption = option;
            actionBtn.disabled = false;
        };
        optionsContainer.appendChild(btn);
    });

    const isLastQuestion = (questionIndex === currentScenarioData.questions.length - 1);
    actionBtn.textContent = isLastQuestion ? "Final Review" : "Next";
    actionBtn.disabled = true;
}

// Attach listeners to window/DOM
window.resetSession = function() {
    if(confirm("Are you sure you want to restart this scenario? All progress will be lost.")) {
        const state = getSessionState();
        state.currentPhaseIndex = 0;
        state.decisions = [];
        state.act854Pillars = { security: 0, defence: 0, foreignRelations: 0, economy: 0, publicHealth: 0, publicSafety: 0, publicOrder: 0, governmentEffectiveness: 0 };
        state.enterpriseRisk = { shareholderConfidence: 0, legalExposure: 0, publicTrust: 0, monetaryLoss: 0 };
        state.capabilityScores = { situationalAwareness: 0, alignmentWithPrinciples: 0, ethicalSafetyImpact: 0, decisiveness: 0, transparency: 0 };
        saveSessionState(state);
        loadScenario(state.scenarioId + ".json");
    }
};

document.getElementById('action-btn').addEventListener('click', () => {
    if (!currentlySelectedOption) return;
    const state = getSessionState();
    const questionData = currentScenarioData.questions[state.currentPhaseIndex];
    
    alert(`Consequence: ${currentlySelectedOption.consequenceText}`);
    processDecision(currentlySelectedOption, questionData);
    
    if (state.currentPhaseIndex >= currentScenarioData.questions.length) {
        renderFinalDebrief();
    } else {
        renderCurrentQuestion(); 
    }
});

// Auto-init Application
document.addEventListener("DOMContentLoaded", () => {
    initSession("ncii-ransomware-wildcard-001");
    loadScenario("ncii-ransomware-wildcard-001.json");
});
