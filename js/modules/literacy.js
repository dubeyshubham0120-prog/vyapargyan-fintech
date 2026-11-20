// Rural Fintech Literacy & Access Platform - Financial Literacy Module

import { lessons } from '../data/lessons.js';
import { audioEngine } from './audioEngine.js';

export class Literacy {
  constructor(appContext) {
    this.app = appContext;
  }

  renderLiteracySection(container) {
    const completed = this.app.state.completedLessons || [];
    const totalBoost = completed.length * 20;

    const html = `
      <div class="literacy-header flex-between mb-3">
        <div>
          <span class="badge badge-accent">Interactive Financial Literacy</span>
          <h2 class="card-title mt-1">Vernacular Audio Micro-Lessons</h2>
          <p class="text-muted">Short 2-minute audio modules to master digital payments, interest math, and credit building.</p>
        </div>
        <div class="literacy-score-badge">
          🎉 Earned Score Boost: <strong>+${totalBoost} Pts</strong> (${completed.length}/${lessons.length} Done)
        </div>
      </div>

      <div class="lessons-grid">
        ${lessons.map(l => {
          const isDone = completed.includes(l.id);
          return `
            <div class="card glass-card lesson-card ${isDone ? 'lesson-completed' : ''}">
              <div class="lesson-header flex-between">
                <span class="lesson-icon-lg">${l.icon}</span>
                <span class="badge ${isDone ? 'badge-success' : 'badge-accent'}">
                  ${isDone ? '✓ Completed (+${l.scoreBoost} Pts)' : `+${l.scoreBoost} Trust Pts`}
                </span>
              </div>

              <h3 class="lesson-title mt-2">${l.title}</h3>
              <div class="lesson-meta text-sm text-muted mt-1">⏱️ ${l.duration} • Regional Audio Included</div>

              <p class="lesson-summary text-sm mt-2">${l.summary}</p>

              <div class="lesson-actions flex-between mt-3">
                <button class="btn btn-audio btn-sm btn-play-lesson" data-audio="${l.audioText}">
                  🔊 Listen Lesson
                </button>
                <button class="btn ${isDone ? 'btn-outline' : 'btn-primary'} btn-quiz-lesson" data-id="${l.id}">
                  ${isDone ? 'Replay Quiz' : '🎮 Play Quiz & Boost Score'}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.innerHTML = html;
    this.attachEvents(container);
  }

  attachEvents(container) {
    // Play lesson audio
    container.querySelectorAll('.btn-play-lesson').forEach(btn => {
      btn.onclick = () => {
        audioEngine.speak(btn.dataset.audio, this.app.state.language);
      };
    });

    // Quiz button
    container.querySelectorAll('.btn-quiz-lesson').forEach(btn => {
      btn.onclick = () => {
        const lessonId = btn.dataset.id;
        const lesson = lessons.find(l => l.id === lessonId);
        this.openQuizModal(lesson);
      };
    });
  }

  openQuizModal(lesson) {
    const q = lesson.quiz;
    const modalHtml = `
      <div class="modal-backdrop" id="modal-quiz">
        <div class="modal-box">
          <div class="modal-header flex-between">
            <h3>🎮 Micro-Lesson Quiz: ${lesson.title}</h3>
            <button class="btn-close" id="modal-close-quiz">×</button>
          </div>
          <div class="modal-body">
            <div class="audio-banner mb-3">
              🔊 <strong>Voice Assistant:</strong> "${q.question}"
            </div>

            <h4 class="quiz-question mb-3">${q.question}</h4>

            <div class="quiz-options-list">
              ${q.options.map((opt, idx) => `
                <button class="quiz-option-btn" data-idx="${idx}">
                  ${String.fromCharCode(65 + idx)}. ${opt}
                </button>
              `).join('')}
            </div>

            <div class="quiz-feedback-box mt-3" id="quiz-feedback" style="display:none;"></div>
          </div>
          <div class="modal-footer flex-between">
            <button class="btn btn-audio btn-sm" id="btn-read-quiz">🔊 Listen Options</button>
            <button class="btn btn-primary" id="btn-submit-quiz-ans" disabled>Confirm Answer</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('modal-quiz');
    let selectedOption = null;

    audioEngine.speak(q.question, this.app.state.language);

    document.getElementById('modal-close-quiz').onclick = () => modal.remove();

    document.getElementById('btn-read-quiz').onclick = () => {
      const allText = q.question + ". Options: " + q.options.join(". ");
      audioEngine.speak(allText, this.app.state.language);
    };

    const confirmBtn = document.getElementById('btn-submit-quiz-ans');
    const feedbackBox = document.getElementById('quiz-feedback');

    modal.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.onclick = () => {
        modal.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedOption = parseInt(btn.dataset.idx);
        confirmBtn.disabled = false;
      };
    });

    confirmBtn.onclick = () => {
      if (selectedOption === q.correctIndex) {
        feedbackBox.style.display = 'block';
        feedbackBox.className = 'quiz-feedback-box success-feedback mt-3';
        feedbackBox.innerHTML = `🎉 <strong>Sahi Jawab! (Correct Answer)</strong><p>${q.explanation}</p><p class="highlight-green mt-1">+${lesson.scoreBoost} Trust Score Boost Earned!</p>`;
        
        // Add to completed lessons
        if (!this.app.state.completedLessons.includes(lesson.id)) {
          this.app.state.completedLessons.push(lesson.id);
        }

        // Trigger confetti
        if (window.confetti) {
          window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }

        audioEngine.speak("Shabash! Sahi jawab! Aapka Trust score badh gaya hai.", this.app.state.language);

        confirmBtn.innerText = "Done & Collect Score Boost";
        confirmBtn.onclick = () => {
          modal.remove();
          this.app.renderActiveTab();
        };
      } else {
        feedbackBox.style.display = 'block';
        feedbackBox.className = 'quiz-feedback-box error-feedback mt-3';
        feedbackBox.innerHTML = `❌ <strong>Galat Jawab! (Try Again)</strong><p>Listen to the audio explanation and try again!</p>`;
        audioEngine.speak("Galat jawab. Phir se koshish karein.", this.app.state.language);
      }
    };
  }
}
