import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_pro';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { prompt, currentCode } = await request.json();

    if (!prompt) {
      return json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
      return json({ error: 'MiniMax API key not configured' }, { status: 500 });
    }

    const systemPrompt = `You are a Mermaid diagram expert. The user wants to modify their existing Mermaid diagram based on their request.

Current diagram code:
${currentCode || 'graph TD\n    A[Start] --> B[End]'}

Rules:
- Modify ONLY the existing diagram code based on the user's request
- Keep the same diagram type unless user asks to change it
- Only output the raw Mermaid code, no markdown code blocks
- Make minimal changes to address the user's request
- If the request is unclear, make reasonable modifications`;

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

    const data = await response.json();
    console.log('MiniMax response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('MiniMax API error:', data);
      return json(
        { error: data.error?.message || 'AI service error' },
        { status: response.status }
      );
    }

    let mermaidCode = data.choices?.[0]?.message?.content?.trim();

    if (!mermaidCode) {
      mermaidCode = data.choices?.[0]?.text?.trim();
    }

    if (!mermaidCode) {
      console.error('No code found in response:', data);
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
