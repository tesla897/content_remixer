const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

const tweetFromPostsPromt = `
Generate tweets based on the provided content.
Focus on generating hype and engagement.
Suggest at least 5 tweets.
Tweets cannot be longer than 140 characters.
Provide the output as a JSON array of strings, for example: ["Tweet 1", "Tweet 2"].
Do not use emojis or hashtags.
Do not include any markdown formatting like \`\`\`json.`

export const remixContent = async (text, apiKey) => {
    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: tweetFromPostsPromt
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Try to parse the content as JSON, handling potential markdown wrapping
        try {
            const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
            const parsed = JSON.parse(cleanContent);
            // Handle if the API returns an object with a key like "tweets" or just an array
            if (Array.isArray(parsed)) return parsed;
            if (parsed.tweets && Array.isArray(parsed.tweets)) return parsed.tweets;
            return [content]; // Fallback if parsing structure is unexpected
        } catch (e) {
            console.warn('Failed to parse JSON response, returning raw text split by newlines', e);
            return content.split('\n').filter(line => line.trim().length > 0);
        }
    } catch (error) {
        console.error('Deepseek API Error:', error);
        throw error;
    }
};
