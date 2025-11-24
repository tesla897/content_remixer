import { createClient } from '@supabase/supabase-js'

let supabase = null

export const initSupabase = (supabaseUrl, supabaseKey) => {
    if (!supabaseUrl || !supabaseKey) return null
    supabase = createClient(supabaseUrl, supabaseKey)
    return supabase
}

export const getSavedTweets = async () => {
    if (!supabase) throw new Error('Supabase not initialized')

    const { data, error } = await supabase
        .from('tweets')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export const saveTweet = async (content) => {
    if (!supabase) throw new Error('Supabase not initialized')

    const { data, error } = await supabase
        .from('tweets')
        .insert([{ content }])
        .select()

    if (error) throw error
    return data[0]
}

export const deleteTweet = async (id) => {
    if (!supabase) throw new Error('Supabase not initialized')

    const { error } = await supabase
        .from('tweets')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export const updateTweet = async (id, content) => {
    if (!supabase) throw new Error('Supabase not initialized')

    const { data, error } = await supabase
        .from('tweets')
        .update({ content })
        .eq('id', id)
        .select()

    if (error) throw error
    return data[0]
}
