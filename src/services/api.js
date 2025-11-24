// Client-side API service - now calls serverless functions instead of AI APIs directly

export const remixContent = async (text, contentType = 'tweet', provider = 'deepseek') => {
    try {
        const response = await fetch('/api/remix', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                contentType,
                provider
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error(`${provider} API Error:`, error);
        throw error;
    }
};
