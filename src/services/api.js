// Client-side API service - now calls serverless functions instead of AI APIs directly

export const remixContent = async (text, contentType = 'tweet', provider = 'deepseek', userApiKey = null) => {
    try {
        const response = await fetch('/api/remix', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                contentType,
                provider,
                userApiKey // Send user's API key if provided
            })
        });

        // Check for non-JSON response (e.g., 404 HTML or 500 text)
        const contentTypeHeader = response.headers.get("content-type");
        if (!contentTypeHeader || !contentTypeHeader.includes("application/json")) {
            const text = await response.text();
            console.error("Received non-JSON response:", text);
            throw new Error(`API returned non-JSON response (Status: ${response.status}). Check console for details.`);
        }

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
