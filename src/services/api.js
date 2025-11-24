const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

const twitterPrompt = `
Generate tweets based on the provided content.
Focus on generating hype and engagement.
Suggest at least 5 tweets.
Tweets cannot be longer than 140 characters.
Provide the output as a JSON array of strings, for example: ["Tweet 1", "Tweet 2"].
Do not use emojis or hashtags.
Do not include any markdown formatting like \`\`\`json.`

const instagramPrompt = `
Generate Instagram captions based on the provided content.
Focus on creating engaging, storytelling captions that connect with the audience.
Suggest at least 5 different caption variations.
Each caption should be between 150-300 characters (can be longer for storytelling).
Use emojis strategically to enhance the message (2-5 emojis per caption).
Include 3-5 relevant hashtags at the end of each caption.
Use line breaks for readability where appropriate.
Include a call-to-action when relevant (e.g., "Double tap if you agree!", "Tag a friend who needs this").
Provide the output as a JSON array of strings, for example: ["Caption 1", "Caption 2"].
Do not include any markdown formatting like \`\`\`json.`

const linkedinPrompt = `
Generate a single high-quality LinkedIn post based on the provided content.
Focus on professional storytelling, industry insights, or personal growth.
The tone should be professional yet authentic and engaging.
Structure the post with a strong hook, valuable body content, and a clear conclusion or question.
Use line breaks effectively for readability.
Include 3-5 relevant hashtags at the end.
Provide the output as a JSON array containing a SINGLE string, for example: "The LinkedIn Post Content...".
Do not include any markdown formatting like \`\`\`json.
`

export const remixContent = async (text, apiKey, contentType = 'tweet', provider = 'deepseek') => {
    try {
        let response;
        let content;
        const prompt = contentType === 'linkedin' ? linkedinPrompt : (contentType === 'instagram' ? instagramPrompt : twitterPrompt);

        if (provider === 'openai') {
            response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o", // or gpt-3.5-turbo
                    messages: [
                        { role: "system", content: prompt },
                        { role: "user", content: text }
                    ],
                    response_format: { type: "json_object" }
                })
            });
        } else if (provider === 'gemini') {
            // Gemini requires a different structure and URL param for key
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt + "\n\nUser Input:\n" + text }]
                    }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });
        } else if (provider === 'claude') {
            // Claude API (Note: Client-side calls often fail CORS)
            response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                    'dangerously-allow-browser': 'true' // Required for client-side calls if allowed
                },
                body: JSON.stringify({
                    model: "claude-3-5-sonnet-20240620",
                    max_tokens: 1024,
                    system: prompt,
                    messages: [{ role: "user", content: text }]
                })
            });
        } else {
            // Default: Deepseek
            response = await fetch(DEEPSEEK_API_URL, {
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
        }

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API request failed (${provider}): ${response.status} ${response.statusText} - ${errText}`);
        }

        const data = await response.json();

        // Parse content based on provider response structure
        if (provider === 'gemini') {
            content = data.candidates[0].content.parts[0].text;
        } else if (provider === 'claude') {
            content = data.content[0].text;
        } else {
            // OpenAI & Deepseek share similar structure
            content = data.choices[0].message.content;
        }

        // Try to parse the content as JSON, handling potential markdown wrapping
        try {
            const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
            const parsed = JSON.parse(cleanContent);

            // Handle if the API returns an object with a key like "tweets" or just an array
            if (Array.isArray(parsed)) return parsed;
            if (parsed.tweets && Array.isArray(parsed.tweets)) return parsed.tweets;

            // Fallback for single string in array
            return [content];
        } catch (e) {
            console.warn('Failed to parse JSON response, returning raw text split by newlines', e);
            // For LinkedIn, we want the whole text as one block, preserving newlines
            if (contentType === 'linkedin') {
                return [content];
            }
            return content.split('\n').filter(line => line.trim().length > 0);
        }
    } catch (error) {
        console.error(`${provider} API Error:`, error);
        throw error;
    }
};
