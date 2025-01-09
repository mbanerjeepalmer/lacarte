import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = async function () {
    try {
        const response = await fetch('https://oauth.reddit.com/api/v1/me', {
            headers: {
                'Authorization': `bearer ${env.HARDCODED_REDDIT_TOKEN}`
            }
        });

        if (!response.ok) {
            console.error('Reddit API error:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                url: response.url,
                redirected: response.redirected,
                type: response.type,
                ok: response.ok
            });
            const errorBody = await response.text().catch(e => `Failed to get response body: ${e}`);
            console.error('Response body:', errorBody);
            throw new Error(`Reddit API returned ${response.status}`);
        }

        const data = await response.json();
        return json(data);
    } catch (error) {
        console.error('Error fetching Reddit data:', error);
        return new Response('Failed to fetch Reddit data', { status: 500 });
    }
}
