/**
 * TinyFish Japan Post Demo Player
 * Handles SSE streaming from TinyFish API and updates UI in real-time
 */

const DemoPlayer = {
  elements: {
    statusText: null,
    progressFill: null,
    demoFrame: null,
    demoPlaceholder: null,
    demoSteps: null,
  },

  state: {
    isRunning: false,
    currentStep: 0,
    totalSteps: 5,
  },

  init() {
    // Get DOM elements
    this.elements.statusText = document.getElementById('statusText');
    this.elements.progressFill = document.getElementById('progressFill');
    this.elements.demoFrame = document.getElementById('demoFrame');
    this.elements.demoPlaceholder = document.getElementById('demoPlaceholder');
    this.elements.demoSteps = document.getElementById('demoSteps');

    // Auto-start demo on page load
    setTimeout(() => this.startDemo(), 1000);
  },

  async startDemo() {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.updateStatus('Initializing TinyFish agent...');
    this.updateProgress(10);

    try {
      // Connect to SSE endpoint
      const eventSource = new EventSource('/api/run-demo');

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleEvent(data);
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
        this.handleError('Demo connection lost. Refresh to try again.');
      };

      // Timeout after 2 minutes
      setTimeout(() => {
        if (this.state.isRunning) {
          eventSource.close();
          this.handleComplete();
        }
      }, 120000);

    } catch (error) {
      console.error('Demo Error:', error);
      this.handleError(error.message);
    }
  },

  handleEvent(data) {
    console.log('Event:', data);

    switch (data.type) {
      case 'STATUS':
        this.updateStatus(data.message);
        break;

      case 'PROGRESS':
        this.updateProgress(data.progress);
        break;

      case 'STEP':
        this.addStep(data.step, data.description);
        break;

      case 'BROWSER_URL':
        this.loadBrowser(data.url);
        break;

      case 'SCREENSHOT':
        this.showScreenshot(data.image);
        break;

      case 'COMPLETE':
        this.handleComplete();
        break;

      case 'ERROR':
        this.handleError(data.message);
        break;
    }
  },

  updateStatus(message) {
    if (this.elements.statusText) {
      this.elements.statusText.textContent = message;
    }
  },

  updateProgress(percent) {
    if (this.elements.progressFill) {
      this.elements.progressFill.style.width = `${percent}%`;
    }
  },

  addStep(step, description) {
    const stepDiv = document.createElement('div');
    stepDiv.textContent = `${step}. ${description}`;
    stepDiv.style.animationDelay = `${this.state.currentStep * 100}ms`;
    this.elements.demoSteps.appendChild(stepDiv);
    this.state.currentStep++;
  },

  loadBrowser(url) {
    // Show streaming URL as a link instead of iframe
    if (this.elements.demoPlaceholder) {
      this.elements.demoPlaceholder.innerHTML = `
        <div style="padding: 32px; text-align: center;">
          <p style="color: var(--color-lagoon); margin-bottom: 16px;">
            <strong>🎥 Live Browser Stream Available</strong>
          </p>
          <a href="${url}" target="_blank" rel="noopener noreferrer"
             style="display: inline-block; padding: 12px 24px; background: var(--color-orange);
                    color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
            Watch Live in New Tab →
          </a>
        </div>
      `;
      this.elements.demoPlaceholder.style.display = 'block';
    }
    // Hide iframe entirely
    if (this.elements.demoFrame) {
      this.elements.demoFrame.style.display = 'none';
    }
  },

  showScreenshot(imageBase64) {
    // Replace iframe with screenshot
    if (this.elements.demoPlaceholder) {
      this.elements.demoPlaceholder.innerHTML = `
        <img src="data:image/png;base64,${imageBase64}"
             style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"
             alt="Japan Post Form Screenshot" />
      `;
      this.elements.demoPlaceholder.style.display = 'block';
    }
    if (this.elements.demoFrame) {
      this.elements.demoFrame.style.display = 'none';
    }
  },

  handleComplete() {
    this.state.isRunning = false;
    this.updateStatus('✓ Demo complete');
    this.updateProgress(100);
    this.addStep('Final', 'Form filled successfully (not submitted)');

    setTimeout(() => {
      this.updateStatus('Ready to run again');
    }, 3000);
  },

  handleError(message) {
    this.state.isRunning = false;
    this.updateStatus(`✗ Error: ${message}`);
    this.addStep('Error', message);
  },
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => DemoPlayer.init());
} else {
  DemoPlayer.init();
}
