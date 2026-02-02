/**
 * Vercel Serverless Function
 * Runs TinyFish agent to fill Japan Post redelivery form
 * Streams progress via Server-Sent Events (SSE)
 */

export const config = {
  maxDuration: 120, // 2 minutes max
};

// Japanese names for demo
const DEMO_NAMES = [
  { family: '田中', given: '太郎', familyRomaji: 'Tanaka', givenRomaji: 'Taro' },
  { family: '佐藤', given: '花子', familyRomaji: 'Sato', givenRomaji: 'Hanako' },
  { family: '鈴木', given: '健太', familyRomaji: 'Suzuki', givenRomaji: 'Kenta' },
  { family: '高橋', given: '美咲', familyRomaji: 'Takahashi', givenRomaji: 'Misaki' },
  { family: '渡辺', given: '翔太', familyRomaji: 'Watanabe', givenRomaji: 'Shota' },
];

// Generate dummy tracking number (Japan Post format: 11-13 digits)
function generateTrackingNumber() {
  const prefix = Math.floor(Math.random() * 9000000000) + 1000000000; // 10 digits
  const suffix = Math.floor(Math.random() * 900) + 100; // 3 digits
  return `${prefix}${suffix}`;
}

// Generate future date (3-7 days from now)
function generateDeliveryDate() {
  const today = new Date();
  const daysAhead = Math.floor(Math.random() * 5) + 3; // 3-7 days
  today.setDate(today.getDate() + daysAhead);

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// Generate delivery time slot
function generateTimeSlot() {
  const slots = [
    '午前中 (8:00-12:00)',
    '14:00-16:00',
    '16:00-18:00',
    '18:00-20:00',
    '19:00-21:00'
  ];
  return slots[Math.floor(Math.random() * slots.length)];
}

export default async function handler(req, res) {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Helper to send SSE events
  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // Generate dummy data
    const randomName = DEMO_NAMES[Math.floor(Math.random() * DEMO_NAMES.length)];
    const trackingNumber = generateTrackingNumber();
    const deliveryDate = generateDeliveryDate();
    const timeSlot = generateTimeSlot();

    sendEvent({
      type: 'STATUS',
      message: 'Starting TinyFish agent...'
    });

    sendEvent({
      type: 'PROGRESS',
      progress: 10
    });

    sendEvent({
      type: 'STEP',
      step: 1,
      description: 'Navigating to Japan Post redelivery form'
    });

    // Call TinyFish API
    const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY || 'sk-mino-ryawPOUEUxGTGSgoGX3Qg8DTkOV8Htm3';
    const JAPAN_POST_URL = 'https://trackings.post.japanpost.jp/delivery/deli/firstDeliveryInput/';

    // Build TinyFish goal prompt (following best practices from docs)
    const goal = `
Navigate to the Japan Post redelivery request form and fill it out with the following information:

Tracking Number (追跡番号): ${trackingNumber}
Name: ${randomName.family} ${randomName.given} (${randomName.familyRomaji} ${randomName.givenRomaji})
Preferred Delivery Date: ${deliveryDate}
Preferred Time Slot: ${timeSlot}

Fill in all required fields. Do NOT click the submit button - stop right before submission.

Note: This is a demonstration with dummy data. All information is randomly generated for testing purposes.
    `.trim();

    sendEvent({
      type: 'PROGRESS',
      progress: 20
    });

    sendEvent({
      type: 'STEP',
      step: 2,
      description: `Using tracking number: ${trackingNumber}`
    });

    // Make request to TinyFish API with SSE streaming
    const response = await fetch('https://mino.ai/v1/automation/run-sse', {
      method: 'POST',
      headers: {
        'X-API-Key': TINYFISH_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: JAPAN_POST_URL,
        goal: goal,
        options: {
          mode: 'stealth', // Avoid detection
          timeout: 90000, // 90 seconds
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`TinyFish API error: ${response.status} ${response.statusText}`);
    }

    sendEvent({
      type: 'PROGRESS',
      progress: 30
    });

    sendEvent({
      type: 'STEP',
      step: 3,
      description: 'Agent is filling out the form...'
    });

    // Stream TinyFish response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentProgress = 30;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event = JSON.parse(line.slice(6));

            // Forward relevant events to client
            if (event.type === 'BROWSER_URL') {
              sendEvent({
                type: 'BROWSER_URL',
                url: event.url
              });
            }

            if (event.type === 'ACTION') {
              currentProgress = Math.min(currentProgress + 10, 90);
              sendEvent({
                type: 'PROGRESS',
                progress: currentProgress
              });

              sendEvent({
                type: 'STEP',
                step: 4,
                description: event.description || 'Performing action...'
              });
            }

            if (event.type === 'COMPLETE' && event.status === 'COMPLETED') {
              sendEvent({
                type: 'PROGRESS',
                progress: 100
              });

              sendEvent({
                type: 'STEP',
                step: 5,
                description: 'Form filled successfully! (Not submitted)'
              });

              sendEvent({
                type: 'COMPLETE',
                result: event.resultJson
              });
            }

            if (event.type === 'ERROR') {
              throw new Error(event.message || 'Unknown error from TinyFish');
            }

          } catch (parseError) {
            console.error('Error parsing SSE event:', parseError);
          }
        }
      }
    }

    // End SSE connection
    res.end();

  } catch (error) {
    console.error('Demo error:', error);

    sendEvent({
      type: 'ERROR',
      message: error.message || 'Unknown error occurred'
    });

    sendEvent({
      type: 'PROGRESS',
      progress: 0
    });

    res.end();
  }
}
