const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

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
                        content: "You are a creative content remixer. Your task is to rewrite the provided text to be more engaging, professional, and impactful while retaining the original meaning. Use markdown formatting where appropriate."
                    },
                    {
                        role: "user",
                        content: text
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Deepseek API Error:', error);
        throw error;
    }
};
