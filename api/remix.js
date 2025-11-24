// Vercel Serverless Function for Content Remixing
// This keeps API keys secure on the server

const PROMPTS = {
    twitter: `
Generate tweets based on the provided content.
Focus on generating hype and engagement.
Suggest at least 5 tweets.
Tweets cannot be longer than 140 characters.
Provide the output as a JSON array of strings, for example: ["Tweet 1", "Tweet 2"].
Do not use emojis or hashtags.
Do not include any markdown formatting like \`\`\`json.`,

    instagram: `
Generate Instagram captions based on the provided content.
Focus on creating engaging, storytelling captions that connect with the audience.
Suggest at least 5 different caption variations.
Each caption should be between 150-300 characters (can be longer for storytelling).
Use emojis strategically to enhance the message (2-5 emojis per caption).
Include 3-5 relevant hashtags at the end of each caption.
Use line breaks for readability where appropriate.
Include a call-to-action when relevant (e.g., "Double tap if you agree!", "Tag a friend who needs this").
Provide the output as a JSON array of strings, for example: ["Caption 1", "Caption 2"].
Do not include any markdown formatting like \`\`\`json.`,

    linkedin: `
Generate a single high-quality LinkedIn post based on the provided content.
Focus on professional storytelling, industry insights, or personal growth.
The tone should be professional yet authentic and engaging.
Structure the post with a strong hook, valuable body content, and a clear conclusion or question.
Use line breaks effectively for readability.
Include 3-5 relevant hashtags at the end.
Provide the output as a JSON array containing a SINGLE string, for example: "The LinkedIn Post Content...".
Do not include any markdown formatting like \`\`\`json.`
};

async function callDeepseek(apiKey, prompt, text) {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: text }
            ],
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Deepseek API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

async function callOpenAI(apiKey, prompt, text) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: text }
            ],
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

async function callGemini(apiKey, prompt, text) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt + "\n\nUser Input:\n" + text }]
            }],
            generationConfig: { responseMimeType: "application/json" }
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

async function callClaude(apiKey, prompt, text) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1024,
            system: prompt,
            messages: [{ role: "user", content: text }]
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.content[0].text;
}

function parseResponse(content, contentType) {
    try {
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleanContent);

        if (Array.isArray(parsed)) return parsed;
        if (parsed.tweets && Array.isArray(parsed.tweets)) return parsed.tweets;

        return [content];
    } catch (e) {
        console.warn('Failed to parse JSON, using fallback', e);
        if (contentType === 'linkedin') {
            return [content];
        }
        return content.split('\n').filter(line => line.trim().length > 0);
    }
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text, contentType, provider } = req.body;

        if (!text || !contentType || !provider) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get API key from environment variables
        const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`];

        if (!apiKey) {
            return res.status(500).json({
                error: `${provider} API key not configured on server`
            });
        }

        // Select prompt based on content type
        const prompt = contentType === 'linkedin'
            ? PROMPTS.linkedin
            : (contentType === 'instagram' ? PROMPTS.instagram : PROMPTS.twitter);

        // Call appropriate API
        let content;
        switch (provider) {
            case 'deepseek':
                content = await callDeepseek(apiKey, prompt, text);
                break;
            case 'openai':
                content = await callOpenAI(apiKey, prompt, text);
                break;
            case 'gemini':
                content = await callGemini(apiKey, prompt, text);
                break;
            case 'claude':
                content = await callClaude(apiKey, prompt, text);
                break;
            default:
                return res.status(400).json({ error: 'Invalid provider' });
        }

        // Parse and return response
        const result = parseResponse(content, contentType);
        res.status(200).json({ result });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: error.message || 'Failed to process request'
        });
    }
}
