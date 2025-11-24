// Client-side Supabase service - now calls serverless functions

export const getSavedItems = async (contentType = 'tweet') => {
    try {
        const response = await fetch('/api/supabase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'getSaved',
                contentType
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch saved items');
        }

        const { data } = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching saved items:', error);
        throw error;
    }
};

export const saveItem = async (content, contentType = 'tweet') => {
    try {
        const response = await fetch('/api/supabase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'save',
                contentType,
                content
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save item');
        }

        const { data } = await response.json();
        return data;
    } catch (error) {
        console.error('Error saving item:', error);
        throw error;
    }
};

export const deleteItem = async (id, contentType = 'tweet') => {
    try {
        const response = await fetch('/api/supabase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete',
                contentType,
                id
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete item');
        }

        return true;
    } catch (error) {
        console.error('Error deleting item:', error);
        throw error;
    }
};

export const updateItem = async (id, content, contentType = 'tweet') => {
    try {
        const response = await fetch('/api/supabase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update',
                contentType,
                id,
                content
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update item');
        }

        const { data } = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating item:', error);
        throw error;
    }
};

// No longer needed - Supabase is initialized on the server
export const initSupabase = () => {
    console.log('Supabase is now initialized on the server');
};
