// Vercel Serverless Function for Supabase Operations
// This keeps Supabase credentials secure on the server

import { createClient } from '@supabase/supabase-js';

let supabase = null;

function initSupabase() {
    if (!supabase) {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase credentials not configured on server');
        }

        supabase = createClient(supabaseUrl, supabaseKey);
    }
    return supabase;
}

function getTableName(contentType) {
    return contentType === 'linkedin'
        ? 'linkedin_posts'
        : (contentType === 'instagram' ? 'captions' : 'tweets');
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

    try {
        const client = initSupabase();
        const { action, contentType, id, content } = req.body;

        switch (action) {
            case 'getSaved': {
                const tableName = getTableName(contentType);
                const { data, error } = await client
                    .from(tableName)
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return res.status(200).json({ data });
            }

            case 'save': {
                const tableName = getTableName(contentType);
                const { data, error } = await client
                    .from(tableName)
                    .insert([{ content }])
                    .select()
                    .single();

                if (error) throw error;
                return res.status(200).json({ data });
            }

            case 'delete': {
                const tableName = getTableName(contentType);
                const { error } = await client
                    .from(tableName)
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                return res.status(200).json({ success: true });
            }

            case 'update': {
                const tableName = getTableName(contentType);
                const { data, error } = await client
                    .from(tableName)
                    .update({ content })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;
                return res.status(200).json({ data });
            }

            default:
                return res.status(400).json({ error: 'Invalid action' });
        }

    } catch (error) {
        console.error('Supabase Error:', error);
        res.status(500).json({
            error: error.message || 'Failed to process request'
        });
    }
}
