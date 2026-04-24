const SESSION_KEY = 'ttx_boardroom_state_v1';

export function getDefaultState() {
  return {
    scenarioId: null,
    currentPhaseIndex: 0,
    decisions: [], 
    act854Pillars: { security: 0, defence: 0, foreignRelations: 0, economy: 0, publicHealth: 0, publicSafety: 0, publicOrder: 0, governmentEffectiveness: 0 },
    capabilityScores: { situationalAwareness: 0, alignmentWithPrinciples: 0, ethicalSafetyImpact: 0, decisiveness: 0, transparency: 0 }
  };
}

export function initSession(scenarioId) {
  let state = getSessionState();
  if (!state || state.scenarioId !== scenarioId) {
    state = getDefaultState();
    state.scenarioId = scenarioId;
    saveSessionState(state);
  }
  return state;
}

export function getSessionState() {
  const rawData = sessionStorage.getItem(SESSION_KEY);
  return rawData ? JSON.parse(rawData) : null;
}

export function saveSessionState(state) { sessionStorage.setItem(SESSION_KEY, JSON.stringify(state)); }

export function recordDecision(decisionRecord) {
  const state = getSessionState();
  if (!state) return;
  state.decisions.push(decisionRecord);
  state.currentPhaseIndex += 1;
  saveSessionState(state);
}

export function exportSessionData() {
  const state = getSessionState();
  if (!state) return;
  const dataStr = JSON.stringify(state, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ttx_debrief_${state.scenarioId}_${new Date().toISOString()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
