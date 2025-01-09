import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { RedditPost } from '$lib/types';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ fetch }) => {
    try {
        const response = await fetch('https://oauth.reddit.com/best', {
            headers: {
                'Authorization': `bearer ${env.HARDCODED_REDDIT_TOKEN}`
            }
        });

        if (!response.ok) {
            // Log full response details
            console.error('Reddit API error:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                url: response.url,
                redirected: response.redirected,
                type: response.type,
                ok: response.ok
            });
            // Get response body if possible
            const errorBody = await response.text().catch(e => `Failed to get response body: ${e}`);
            console.error('Response body:', errorBody);
            throw new Error(`Reddit API returned ${response.status}`);
        }

        const data = await response.json();

        if (data.data.children.length > 0) {
            console.debug('First item:', JSON.stringify(data.data.children[0].data, null, 4));
        }

        // Transform Reddit posts to match our Piece interface
        const pieces = data.data.children.map((post: RedditPost) => ({
            reddit_id: post.id,
            title: post.data.title,
            // Using score as a proxy for tone (normalized to 0-1)
            tone: Math.min(1, Math.max(0, post.data.score / 10000)),
            // Using subreddit name length as a temporary topic projection
            topicProjection: Math.min(1, post.data.subreddit.length / 20),
            source: 'reddit'
        }));

        return json({ pieces });
    } catch (error) {
        console.error('Error fetching Reddit data:', error);
        return new Response('Failed to fetch Reddit data', { status: 500 });
    }
}
