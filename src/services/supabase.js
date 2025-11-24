import { createClient } from '@supabase/supabase-js'

let supabase = null

export const initSupabase = (supabaseUrl, supabaseKey) => {
    if (!supabaseUrl || !supabaseKey) return null
    supabase = createClient(supabaseUrl, supabaseKey)
    return supabase
}

// Get saved items (tweets or captions)
export const getSavedItems = async (contentType = 'tweet') => {
    if (!supabase) throw new Error('Supabase not initialized')

    const tableName = contentType === 'linkedin' ? 'linkedin_posts' : (contentType === 'instagram' ? 'captions' : 'tweets')

    const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

// Save item (tweet or caption)
export const saveItem = async (content, contentType = 'tweet') => {
    if (!supabase) throw new Error('Supabase not initialized')

    const tableName = contentType === 'linkedin' ? 'linkedin_posts' : (contentType === 'instagram' ? 'captions' : 'tweets')

    const { data, error } = await supabase
        .from(tableName)
        .insert([{ content }])
        .select()

    if (error) {
        console.error('Supabase save error:', error)
        console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        })
        throw error
    }

    if (!data || data.length === 0) {
        throw new Error('No data returned from insert operation')
    }

    return data[0]
}

// Delete item
export const deleteItem = async (id, contentType = 'tweet') => {
    if (!supabase) throw new Error('Supabase not initialized')

    const tableName = contentType === 'linkedin' ? 'linkedin_posts' : (contentType === 'instagram' ? 'captions' : 'tweets')

    const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

    if (error) throw error
}

// Update item
export const updateItem = async (id, content, contentType = 'tweet') => {
    if (!supabase) throw new Error('Supabase not initialized')

    const tableName = contentType === 'linkedin' ? 'linkedin_posts' : (contentType === 'instagram' ? 'captions' : 'tweets')

    const { data, error } = await supabase
        .from(tableName)
        .update({ content })
        .eq('id', id)
        .select()

    if (error) throw error
    return data[0]
}


