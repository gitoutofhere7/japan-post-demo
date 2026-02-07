/**
 * Vercel Edge Function (Supports SSE Streaming!)
 * Runs TinyFish agent to fill Japan Post redelivery form
 * Streams progress via Server-Sent Events (SSE)
 */

export const config = {
  runtime: 'edge', // CRITICAL: Edge runtime for SSE support
};

// Japanese names for demo
const DEMO_NAMES = [
  { family: '田中', given: '太郎', familyRomaji: 'Tanaka', givenRomaji: 'Taro' },
  { family: '佐藤', given: '花子', familyRomaji: 'Sato', givenRomaji: 'Hanako' },
  { family: '鈴木', given: '健太', familyRomaji: 'Suzuki', givenRomaji: 'Kenta' },
  { family: '高橋', given: '美咲', familyRomaji: 'Takahashi', givenRomaji: 'Misaki' },
  { family: '渡辺', given: '翔太', familyRomaji: 'Watanabe', givenRomaji: 'Shota' },
];

// Generate dummy tracking number (Japan Post format)
// Japan Post Yu-Pack tracking numbers are typically 11 digits
// Format: 12345678901 (11 consecutive digits)
// Starting with 1-9 to avoid leading zeros
function generateTrackingNumber() {
  // Generate 11-digit number starting with 1-9
  const firstDigit = Math.floor(Math.random() * 9) + 1; // 1-9
  const remaining = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0'); // 10 digits
  return `${firstDigit}${remaining}`;
}

// Generate future date (3-7 days from now)
function generateDeliveryDate() {
  const today = new Date();
  const daysAhead = Math.floor(Math.random() * 5) + 3;
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

export default async function handler(req) {
  // Create a TransformStream for SSE
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Helper to send SSE events
  const sendEvent = async (data) => {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    await writer.write(encoder.encode(message));
  };

  // Start async processing
  (async () => {
    try {
      // Generate dummy data
      const randomName = DEMO_NAMES[Math.floor(Math.random() * DEMO_NAMES.length)];
      const trackingNumber = generateTrackingNumber();
      const deliveryDate = generateDeliveryDate();
      const timeSlot = generateTimeSlot();

      await sendEvent({
        type: 'STATUS',
        message: 'Starting TinyFish agent...'
      });

      await sendEvent({
        type: 'PROGRESS',
        progress: 10
      });

      await sendEvent({
        type: 'STEP',
        step: 1,
        description: 'Navigating to Japan Post redelivery form'
      });

      // Call TinyFish API
      const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY || 'sk-mino-ryawPOUEUxGTGSgoGX3Qg8DTkOV8Htm3';
      const JAPAN_POST_URL = 'https://trackings.post.japanpost.jp/delivery/deli/firstDeliveryInput/';

      // Build TinyFish goal prompt
      const goal = `
This is a DEMO for a live event. Your goal is to demonstrate form-filling capability, NOT to complete the form successfully.

1. Navigate to the Japan Post redelivery form
2. Attempt to fill in these fields:
   - Tracking Number: ${trackingNumber}
   - Name: ${randomName.family} ${randomName.given}
   - Delivery Date: ${deliveryDate}
   - Time Slot: ${timeSlot}

3. If the tracking number is rejected, that's OK - just demonstrate the interaction
4. Do NOT search the web for valid tracking numbers
5. Do NOT try multiple approaches - just show the form interaction
6. Stop after demonstrating form filling (whether successful or not)

This is for a conference demo at Hotel Okura Tokyo on February 18, 2026.
      `.trim();

      await sendEvent({
        type: 'PROGRESS',
        progress: 20
      });

      await sendEvent({
        type: 'STEP',
        step: 2,
        description: `Using tracking number: ${trackingNumber}`
      });

      // Make request to TinyFish API
      let response;
      try {
        response = await fetch('https://agent.tinyfish.ai/v1/automation/run-sse', {
          method: 'POST',
          headers: {
            'X-API-Key': TINYFISH_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: JAPAN_POST_URL,
            goal: goal,
            options: {
              mode: 'stealth',
              timeout: 90000,
            }
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('TinyFish API error response:', errorText);
          throw new Error(`TinyFish API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
      } catch (fetchError) {
        console.error('TinyFish API fetch error:', fetchError);
        throw fetchError;
      }

      await sendEvent({
        type: 'PROGRESS',
        progress: 30
      });

      await sendEvent({
        type: 'STEP',
        step: 3,
        description: 'Agent is filling out the form...'
      });

      // Stream TinyFish response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentProgress = 30;
      let stepCounter = 4; // Start from step 4 (steps 1-3 are initial setup)

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

              // Log all TinyFish events for debugging
              console.log('TinyFish event:', event.type, event);

              // Forward relevant events to client
              if (event.type === 'STARTED') {
                await sendEvent({
                  type: 'STATUS',
                  message: 'TinyFish agent started',
                  runId: event.runId
                });
              }

              if (event.type === 'STREAMING_URL') {
                await sendEvent({
                  type: 'BROWSER_URL',
                  url: event.streamingUrl
                });
              }

              if (event.type === 'PROGRESS') {
                currentProgress = Math.min(currentProgress + 5, 95);
                await sendEvent({
                  type: 'PROGRESS',
                  progress: currentProgress
                });

                await sendEvent({
                  type: 'STEP',
                  step: stepCounter++,
                  description: event.purpose || 'Performing action...'
                });
              }

              if (event.type === 'COMPLETE') {
                await sendEvent({
                  type: 'PROGRESS',
                  progress: 100
                });

                if (event.status === 'COMPLETED') {
                  await sendEvent({
                    type: 'STEP',
                    step: stepCounter,
                    description: 'Form filled successfully! (Not submitted)'
                  });

                  await sendEvent({
                    type: 'COMPLETE',
                    result: event.resultJson
                  });
                } else if (event.status === 'FAILED') {
                  throw new Error(event.error || 'Automation failed');
                }
              }

              if (event.type === 'ERROR') {
                throw new Error(event.message || event.error || 'Unknown error from TinyFish');
              }

            } catch (parseError) {
              console.error('Error parsing SSE event:', parseError);
            }
          }
        }
      }

    } catch (error) {
      console.error('Demo error:', error);

      await sendEvent({
        type: 'ERROR',
        message: error.message || 'Unknown error occurred'
      });

      await sendEvent({
        type: 'PROGRESS',
        progress: 0
      });
    } finally {
      // Close the stream
      await writer.close();
    }
  })();

  // Return streaming response
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
