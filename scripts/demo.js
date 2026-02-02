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
    // Load TinyFish streaming URL in iframe
    if (this.elements.demoPlaceholder) {
      this.elements.demoPlaceholder.style.display = 'none';
    }
    if (this.elements.demoFrame) {
      this.elements.demoFrame.src = url;
      this.elements.demoFrame.style.display = 'block';
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

    // Show event CTA
    if (this.elements.demoPlaceholder) {
      this.elements.demoPlaceholder.innerHTML = `
        <div style="padding: 64px 48px; text-align: center; background: linear-gradient(135deg, #00343B 0%, #004854 100%);">
          <div style="font-size: 72px; margin-bottom: 24px;">🎉</div>
          <h2 style="color: #E7FF84; font-size: 32px; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.5px;">
            日本のフォーム、完璧に処理
          </h2>
          <p style="color: #FECB8B; font-size: 18px; margin-bottom: 32px; line-height: 1.6;">
            Japanese websites are complex. Our agents handle them.<br>
            See more live demos like this at our event.
          </p>

          <div style="background: rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 32px; margin-bottom: 32px; backdrop-filter: blur(10px);">
            <h3 style="color: white; font-size: 24px; font-weight: 600; margin-bottom: 8px;">
              9 Techies × オークラ東京
            </h3>
            <p style="color: #FECB8B; font-size: 16px; margin-bottom: 0;">
              February 18, 2026 • Hotel Okura Tokyo
            </p>
          </div>

          <a href="https://events.geodesiccap.com/2026devlab/10698450?ref=TinyFish&reg_type_id=1065460"
             target="_blank"
             rel="noopener noreferrer"
             style="display: inline-block; background: linear-gradient(135deg, #FF6700 0%, #FF8534 100%);
                    color: white; padding: 18px 48px; border-radius: 12px; text-decoration: none;
                    font-weight: 600; font-size: 18px; box-shadow: 0 8px 24px rgba(255, 103, 0, 0.4);
                    transition: transform 0.2s, box-shadow 0.2s;"
             onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 32px rgba(255, 103, 0, 0.5)';"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 24px rgba(255, 103, 0, 0.4)';">
            Register for Free →
          </a>

          <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin-top: 24px;">
            無料 • 席は限られています
          </p>
        </div>
      `;
      this.elements.demoPlaceholder.style.display = 'block';
    }

    setTimeout(() => {
      this.updateStatus('Demo ready • Refresh to run again');
    }, 2000);
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
