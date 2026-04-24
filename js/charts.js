import { getSessionState, exportSessionData } from './storage.js';

export function renderFinalDebrief() {
    const state = getSessionState();
    if (!state) return;

    const centerCanvas = document.querySelector('.center-canvas');
    
    // Attach export to window scope so inline onclick works
    window.exportSessionData = exportSessionData;

    centerCanvas.innerHTML = `
        <div class="prompt-box">
            <h2>Exercise Complete</h2>
            <p>Your decisions have been logged. The radar below measures your decision-making capability across the five core dimensions.</p>
        </div>
        <div class="chart-container" style="position: relative; height:400px; width:100%; background: #fff; padding: 1rem; border-radius: 8px; border: 1px solid #e5e7eb;">
            <canvas id="capabilityRadar"></canvas>
        </div>
        <div class="action-footer" style="margin-top: 1.5rem;">
            <button class="primary-btn" onclick="exportSessionData()">Export Debrief Report</button>
        </div>
    `;

    const ctx = document.getElementById('capabilityRadar').getContext('2d');
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Situational Awareness', 'Alignment with Principles', 'Ethical & Safety Impact', 'Decisiveness', 'Transparency'],
            datasets: [
                {
                    label: 'Participant Score',
                    data: [
                        state.capabilityScores.situationalAwareness,
                        state.capabilityScores.alignmentWithPrinciples,
                        state.capabilityScores.ethicalSafetyImpact,
                        state.capabilityScores.decisiveness,
                        state.capabilityScores.transparency
                    ],
                    backgroundColor: 'rgba(17, 24, 39, 0.2)',
                    borderColor: 'rgba(17, 24, 39, 1)',
                    pointBackgroundColor: 'rgba(17, 24, 39, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Target Benchmark',
                    data: [4, 4, 4, 4, 4],
                    backgroundColor: 'rgba(16, 185, 129, 0.0)',
                    borderColor: 'rgba(16, 185, 129, 0.5)',
                    borderDash: [5, 5],
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { r: { angleLines: { color: 'rgba(0, 0, 0, 0.1)' }, grid: { color: 'rgba(0, 0, 0, 0.1)' }, pointLabels: { font: { size: 12 }, color: '#1f2937' }, ticks: { min: 0, max: 5, stepSize: 1, display: false } } },
            plugins: { legend: { position: 'bottom' } }
        }
    });
}
