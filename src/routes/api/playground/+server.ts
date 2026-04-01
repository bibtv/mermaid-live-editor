import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_pro';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
      return json({ error: 'MiniMax API key not configured' }, { status: 500 });
    }

    const systemPrompt = `You are a Mermaid diagram expert. Convert the user's description into a valid Mermaid diagram code.
Rules:
- Only output the raw Mermaid code, no markdown code blocks
- Use standard Mermaid syntax for flowcharts, sequence diagrams, class diagrams, etc.
- Make the diagram clear and well-structured
- If the description is vague, create a reasonable interpretation`;

    const response = await fetch(MINIMAX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'MiniMax-Text-01',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MiniMax API error:', errorText);
      return json({ error: 'AI service error' }, { status: response.status });
    }

    const data = await response.json();
    const mermaidCode = data.choices?.[0]?.message?.content?.trim();

    if (!mermaidCode) {
      return json({ error: 'No response from AI' }, { status: 500 });
    }

    return json({ code: mermaidCode });
  } catch (error) {
    console.error('Playground error:', error);
    return json({ error: 'Failed to generate diagram' }, { status: 500 });
  }
};
