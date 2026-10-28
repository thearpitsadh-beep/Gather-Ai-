import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Helper to safely call Gemini or use high-quality heuristics fallback
app.post('/api/ai/ideas', async (req, res) => {
  try {
    const { eventType, title, vibe, guestCount, budget, currency } = req.body;

    if (ai) {
      const prompt = `You are a world-class luxury and community event planner.
Event Details:
- Title: ${title || 'Special Event'}
- Type: ${eventType || 'wedding'}
- Desired Vibe/Aesthetic: ${vibe || 'Elegant & Memorable'}
- Expected Guests: ${guestCount || 100}
- Total Budget: ${budget || 10000} ${currency || 'USD'}

Generate 6 personalized, creative, high-impact ideas for this event across themes, decor, entertainment, guest engagement, and budget efficiency.
Respond strictly in JSON format according to this schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                category: {
                  type: Type.STRING,
                  description:
                    'One of: theme, decor, entertainment, budget_tip, schedule, speech, contingency',
                },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['category', 'title', 'description', 'tags'],
            },
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '[]');
      return res.json({ ideas: parsed });
    }

    // Heuristics fallback
    const fallbackIdeas = getFallbackIdeas(eventType, vibe);
    return res.json({ ideas: fallbackIdeas });
  } catch (err: any) {
    console.error('AI Ideas error:', err?.message || err);
    const fallbackIdeas = getFallbackIdeas(req.body.eventType, req.body.vibe);
    return res.json({ ideas: fallbackIdeas, note: 'Used intelligent heuristic recommendations' });
  }
});

app.post('/api/ai/speech', async (req, res) => {
  try {
    const { role, speakerName, honoreeName, tone, anecdotes, eventType } = req.body;

    if (ai) {
      const prompt = `Write an authentic, memorable speech/toast for a ${eventType || 'celebration'}.
Speaker: ${speakerName || 'Host'} (${role || 'Close Friend'})
Honoree / Audience: ${honoreeName || 'Guests'}
Desired Tone: ${tone || 'Warm and mildly humorous'}
Key Anecdotes or Notes to include: ${anecdotes || 'Gratitude for everyone gathering together, cherished memories'}
Length: approximately 300 to 450 words, easy to deliver with natural pauses.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({ speech: response.text });
    }

    const fallbackSpeech = generateFallbackSpeech(role, speakerName, honoreeName, tone);
    return res.json({ speech: fallbackSpeech });
  } catch (err: any) {
    console.error('AI Speech error:', err?.message || err);
    const fallbackSpeech = generateFallbackSpeech(req.body.role, req.body.speakerName, req.body.honoreeName, req.body.tone);
    return res.json({ speech: fallbackSpeech });
  }
});

app.post('/api/ai/contingency', async (req, res) => {
  try {
    const { eventType, location, weatherRisk, indoorOutdoor } = req.body;

    if (ai) {
      const prompt = `You are a senior event safety and contingency director.
Event Type: ${eventType}
Location: ${location}
Setting: ${indoorOutdoor || 'hybrid indoor/outdoor'}
Specific Risk Concern: ${weatherRisk || 'sudden rain or vendor no-show'}

Generate 4 realistic contingency action plans. For each plan provide:
1. Scenario
2. Trigger Condition
3. Immediate Action Protocol (step-by-step)
4. Key Point of Contact / Equipment needed.
Return in JSON format.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                scenario: { type: Type.STRING },
                trigger: { type: Type.STRING },
                protocol: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                equipmentOrContact: { type: Type.STRING },
              },
              required: ['scenario', 'trigger', 'protocol', 'equipmentOrContact'],
            },
          },
        },
      });

      return res.json({ plans: JSON.parse(response.text?.trim() || '[]') });
    }

    return res.json({
      plans: [
        {
          scenario: 'Precipitation or Severe Weather',
          trigger: 'Rain forecast >40% 48h prior or active rain on event day',
          protocol: [
            'Notify rental vendor to pitch marquee or deploy side-walls by 09:00',
            'Relocate electrical equipment and sound board to covered awning',
            'Distribute branded umbrellas at guest entry and reposition seating chart indoors',
          ],
          equipmentOrContact: 'Venue Manager + Tent Rental vendor emergency hotline',
        },
        {
          scenario: 'Key Vendor Delay or No-Show',
          trigger: 'Vendor unresponsive 60 minutes past scheduled load-in',
          protocol: [
            'Contact secondary backup vendor on preferred emergency list',
            'Designate assistant coordinator to oversee quick setup',
            'Adjust timeline run-sheet buffer time by 20 minutes seamlessly',
          ],
          equipmentOrContact: 'Lead Coordinator (Direct mobile) + Vendor dispatch',
        },
      ],
    });
  } catch (err: any) {
    console.error('Contingency error:', err);
    return res.status(500).json({ error: 'Failed to generate contingency' });
  }
});

app.post('/api/ai/budget-optimizer', async (req, res) => {
  try {
    const { totalBudget, eventType, guestCount } = req.body;
    const numBudget = Number(totalBudget) || 10000;

    if (ai) {
      const prompt = `As a professional event budget strategist, optimize an overall budget of $${numBudget} for a ${eventType || 'event'} with ${guestCount || 100} guests.
Provide recommended expense allocations across:
venue, catering, photography, entertainment, decor, logistics, and contingency.
Return in JSON format with category, recommendedAmount, percentage, and strategicTip.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                recommendedAmount: { type: Type.NUMBER },
                percentage: { type: Type.NUMBER },
                strategicTip: { type: Type.STRING },
              },
              required: ['category', 'recommendedAmount', 'percentage', 'strategicTip'],
            },
          },
        },
      });

      return res.json({ allocations: JSON.parse(response.text?.trim() || '[]') });
    }

    // Default industry ratios
    const allocations = [
      { category: 'venue', percentage: 25, recommendedAmount: Math.round(numBudget * 0.25), strategicTip: 'Lock in deposit early to freeze peak rates.' },
      { category: 'catering', percentage: 35, recommendedAmount: Math.round(numBudget * 0.35), strategicTip: 'Audit final headcount 7 days prior to prevent wasted covers.' },
      { category: 'photography', percentage: 12, recommendedAmount: Math.round(numBudget * 0.12), strategicTip: 'Book 8 hours rather than full day to save 20% on overtime fees.' },
      { category: 'entertainment', percentage: 10, recommendedAmount: Math.round(numBudget * 0.10), strategicTip: 'Ensure venue sound system connects with DJ gear to avoid rental fees.' },
      { category: 'decor', percentage: 10, recommendedAmount: Math.round(numBudget * 0.10), strategicTip: 'Repurpose ceremony florals for dinner banquet tables.' },
      { category: 'logistics & permits', percentage: 8, recommendedAmount: Math.round(numBudget * 0.08), strategicTip: 'Keep a 5-8% emergency buffer for last-minute add-ons.' },
    ];
    return res.json({ allocations });
  } catch (err: any) {
    console.error('Budget optimizer error:', err);
    return res.status(500).json({ error: 'Failed to optimize budget' });
  }
});

// Simulated email automation dispatch
app.post('/api/email/simulate-send', (req, res) => {
  const { reminderId, subject, recipientsCount, targetAudience } = req.body;
  const timestamp = new Date().toISOString();
  return res.json({
    success: true,
    reminderId,
    timestamp,
    message: `Dispatched "${subject}" to ${recipientsCount} recipients (${targetAudience}).`,
  });
});

// Fallback generators
function getFallbackIdeas(eventType: string = 'wedding', vibe: string = 'elegant') {
  if (eventType === 'birthday') {
    return [
      {
        id: 'fb-b1',
        category: 'theme',
        title: 'Retro Neon Glow Arcade Lounge',
        description: 'Set up vintage pinball and cocktail arcade machines with UV ambient lighting and retro synthwave playlists.',
        tags: ['Glow', 'Interactive', 'Nostalgic'],
      },
      {
        id: 'fb-b2',
        category: 'decor',
        title: 'Customized Polaroid Photo Wall & Guest Keepsake',
        description: 'Provide instant cameras with metallic markers and pegboards for guests to snap candid portraits and leave handwritten notes.',
        tags: ['DIY', 'Memories', 'Visual'],
      },
      {
        id: 'fb-b3',
        category: 'entertainment',
        title: 'Signature Mocktail/Cocktail Tasting Station',
        description: 'Name 3 signature cocktails after the guest of honor’s milestones or favorite places with interactive flair bartending.',
        tags: ['Food & Drink', 'Custom'],
      },
      {
        id: 'fb-b4',
        category: 'budget_tip',
        title: 'Digital Playlist & Curated Lighting instead of Live Band',
        description: 'A pre-mixed high-energy playlist with wireless synchronized uplights creates a festival atmosphere at a fraction of the cost.',
        tags: ['Cost-Saver', 'Tech'],
      },
    ];
  }

  if (eventType === 'community') {
    return [
      {
        id: 'fb-c1',
        category: 'theme',
        title: 'Eco-Living & Sustainable Local Makers Showcase',
        description: 'Highlight local artisans, seed-bomb making booths, and zero-waste community dining tables made with reclaimed cedar.',
        tags: ['Civic', 'Eco-friendly', 'Family'],
      },
      {
        id: 'fb-c2',
        category: 'entertainment',
        title: 'Acoustic Porch Stage & Open Mic Hour',
        description: 'Rotate local school bands and acoustic performers on a timber pallet stage, keeping audio clear and friendly.',
        tags: ['Community', 'Inclusive', 'Live'],
      },
      {
        id: 'fb-c3',
        category: 'contingency',
        title: 'Fast-Track Civic Permits & Shade Marquees',
        description: 'Coordinate with local park rangers for water refill stations and free sunscreen kiosks under municipal pop-up tents.',
        tags: ['Safety', 'Permits', 'Accessibility'],
      },
    ];
  }

  // Wedding default
  return [
    {
      id: 'fb-w1',
      category: 'theme',
      title: 'Tuscan Sunset & Olive Grove Elegance',
      description: 'Earthy terracotta pots, fragrant rosemary sprigs, warm string festoon lighting, and communal timber feast tables.',
      tags: ['Romantic', 'Timeless', 'Warm'],
    },
    {
      id: 'fb-w2',
      category: 'decor',
      title: 'Repurposed Ceremony Arch to Head Table Backdrop',
      description: 'Have coordinators glide the ceremony floral arch behind the bride and groom table right before reception dinner.',
      tags: ['Floral', 'Sustainable', 'Smart Budget'],
    },
    {
      id: 'fb-w3',
      category: 'entertainment',
      title: 'Audio Guestbook Vintage Rotary Phone',
      description: 'A refurbished 1960s rotary telephone where guests pick up the receiver, hear a personalized message, and leave voice recordings.',
      tags: ['Interactive', 'Keepsake'],
    },
    {
      id: 'fb-w4',
      category: 'budget_tip',
      title: 'BYO Alcohol with Corkage Negotiations',
      description: 'Purchasing boutique wines directly and negotiating a flat corkage fee saves an average of 35% on open bar invoices.',
      tags: ['Cost Saving', 'Catering'],
    },
  ];
}

function generateFallbackSpeech(role: string = 'Best Friend', speakerName: string = 'Speaker', honoreeName: string = 'Honoree', tone: string = 'Heartfelt') {
  return `Good evening everyone! For those who don't know me, I'm ${speakerName}, and I have the immense honor of being ${honoreeName}'s ${role}.

Standing here today, looking around this room filled with people who love you, it is impossible not to feel the profound joy you bring everywhere you go.

From our early days when we talked about our wildest dreams to watching those very dreams unfold today, one thing has never changed: your generous heart, your fierce loyalty, and the way you make every person feel like they truly matter.

May your journey ahead be filled with laughter that makes your sides ache, quiet moments of wonder, and endless adventures together.

Everyone, please raise your glasses with me: To ${honoreeName}—to love, laughter, and an unforgettable celebration! Cheers!`;
}

// Development or production middleware
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
