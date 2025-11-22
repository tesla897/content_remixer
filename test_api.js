import fetch from 'node-fetch';

const API_KEY = 'sk-80bc02d99a764ddb90b4b9b0b272f685';
const API_URL = 'https://api.deepseek.com/chat/completions';

const testRemix = async () => {
    console.log('Testing Deepseek API...');
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "You are a creative content remixer."
                    },
                    {
                        role: "user",
                        content: "Test content for remixing."
                    }
                ]
            })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            return;
        }

        const data = await response.json();
        console.log('API Response:', JSON.stringify(data, null, 2));

        if (data.choices && data.choices[0]) {
            console.log('Remixed content:', data.choices[0].message.content);
        } else {
            console.error('Unexpected response structure');
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
};

testRemix();
