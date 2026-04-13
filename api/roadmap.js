export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { idea, age, background, budget, time, blocker } = req.body;

  if (!idea || !background || !budget || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const prompt = `You are BizVice — a brutally honest, highly intelligent AI business advisor built for young entrepreneurs aged 18–28. You think in systems, leverage, and compounding. You are direct, practical, and allergic to fluff.

A user has submitted their business idea. Generate a structured, personalized business roadmap.

USER PROFILE:
- Business Idea: ${idea}
- Age: ${age || 'Not specified'}
- Background: ${background}
- Starting Budget: ${budget}
- Daily Time Available: ${time}
- Biggest Fear / Blocker: ${blocker || 'Not specified'}

Generate a response with these exact sections using this format:

## THE HONEST VERDICT
Give a 2-3 sentence brutally honest assessment of the idea. Is it viable? What's the real opportunity?

## YOUR UNFAIR ADVANTAGE
What does this person have going for them given their background, age, and context that they should lean into?

## THE 90-DAY ROADMAP

### Month 1 — Validate Before You Build
List 4-5 specific actions to validate the idea with zero or minimal money. Be extremely specific to their idea.

### Month 2 — Build the Minimum Version
List 4-5 specific actions to build the simplest version that generates revenue. Name actual tools, platforms, or methods.

### Month 3 — Get First Paying Customers
List 4-5 specific actions focused entirely on sales, distribution, and getting paid. Real tactics, not theory.

## THE #1 RISK YOU MUST AVOID
Name the single biggest mistake people with this exact idea make, and how to avoid it.

## YOUR FIRST ACTION (Do This Today)
Give ONE ultra-specific action they can take in the next 3 hours to start. Make it so clear they have zero excuse not to do it.

## REVENUE POTENTIAL
Give a realistic 6-month and 12-month revenue estimate based on their budget and time, with the assumptions clearly stated.

Be specific to THEIR idea throughout. Never give generic advice. Use their background and budget to make every recommendation realistic. Be direct, sharp, and motivating — like a smart friend who refuses to let them fail.`;

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash
:generateContent`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1500, temperature: 0.7 }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Gemini API error' });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) return res.status(500).json({ error: 'No response from Gemini' });

    return res.status(200).json({ roadmap: text });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
