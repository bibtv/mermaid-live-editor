import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

const API_URL = 'https://api.minimax.io/v1/chat/completions';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { prompt, currentCode } = await request.json();

    if (!prompt) {
      return json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
      return json({ error: 'AI API key not configured' }, { status: 500 });
    }

    const userMessage = currentCode
      ? `Modify this Mermaid diagram: ${currentCode}\n\nRequest: ${prompt}`
      : `Create a Mermaid diagram: ${prompt}`;

    console.log('API Key prefix:', apiKey.substring(0, 10));

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7',
        messages: [{ role: 'user', content: userMessage }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return json(
        { error: data.error?.message || data.base_resp?.status_msg || 'AI service error' },
        { status: response.status }
      );
    }

    let mermaidCode = data.choices?.[0]?.message?.content?.trim();

    if (!mermaidCode) {
      return json({ error: 'No response from AI' }, { status: 500 });
    }

    mermaidCode = mermaidCode
      .replace(/^```mermaid\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    return json({ code: mermaidCode });
  } catch (error) {
    console.error('Playground error:', error);
    return json({ error: 'Failed to generate diagram' }, { status: 500 });
  }
};
