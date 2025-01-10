import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { RedditPost, Piece } from '$lib/types';
import { env } from '$env/dynamic/private';
import Groq from 'groq-sdk';
import { getTopicProjections } from '$lib/embeddings';
import { error } from '@sveltejs/kit';

const client = new Groq({
    apiKey: env.GROQ_API_KEY
});

async function retryRequest<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            console.debug(`On attempt ${attempt} of ${maxAttempts} got ${error.status}`, error);
            if (attempt === maxAttempts || !(error.status === 503 || error.status === 429)) {
                console.error('Error in retryRequest');
                throw error;
            }

            let delay = 15000;
            if (error.headers?.['retry-after']) {
                delay = parseInt(error.headers['retry-after']) * 1000;
            }
            console.debug(`Waiting ${delay}ms before retrying`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('Max retries reached');
}

function extractJson(text: string): any {
    // Try to match anything between curly braces, including newlines
    const pattern = /({[\s\S]*})/;
    const match = text.match(pattern);

    if (match) {
        try {
            return JSON.parse(match[1]);
        } catch (error) {
            console.error('Failed to parse extracted JSON', error);
            return null;
        }
    }

    console.warn('No JSON found in text:', text);
    return null;
}

function parseRatingResponse(response: string) {
    try {
        return JSON.parse(response);
    } catch (error) {
        console.error('Error parsing rating response directly, attempting extraction', error);
        return extractJson(response);
    }
}

async function rateTones(posts: RedditPost[]): Promise<Record<string, number>> {
    return retryRequest(async () => {
        const redditPosts = JSON.stringify(posts.map(post => ({
            id: post.data.id,
            title: post.data.title,
            subreddit: post.data.subreddit
        })), null, 0);

        console.debug('REDDIT POSTS', redditPosts);

        const completion = await client.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Rate the tone of each post title from 0.0 (whimsical, casual, silly, funny) to 1.0 (serious, formal, complex, weighty, deep).
Return only a JSON object mapping post IDs to tone scores.
Example input: [{"id":"1hwwvuz","title":"This sums my experience with models on Groq","subreddit":"LocalLLaMA"},{"id":"1hx7421","title":"TransPixar: a new generative model that preserves transparency,","subreddit":"LocalLLaMA"},{"id":"1hx973s","title":"BREAKING NEWS: AI safety blogging companies partnering with Defense Technology companies to lobby for regulations on 'dangerous' Open source AI.","subreddit":"LocalLLaMA"},{"id":"1hwoegx","title":"Valley Heat left a void in me","subreddit":"podcasts"},{"id":"1hx60t4","title":"New Microsoft research - rStar-Math: Small LLMs Can Master Math Reasoning with Self-Evolved Deep Thinking\n","subreddit":"LocalLLaMA"},{"id":"1hxap5s","title":"Trying to remember a podcast","subreddit":"podcasts"},{"id":"1hx5i8u","title":"Phi 4 is just 14B But Better than llama 3.1 70b for several tasks. ","subreddit":"LocalLLaMA"},{"id":"1hx5486","title":"We’re gonna have AGI by the end of this year aren’t we lol","subreddit":"singularity"},{"id":"1hx6v4k","title":"Need Help Remembering Podcast","subreddit":"podcasts"},{"id":"1hws1bv","title":"What podcast has the funniest storytelling?","subreddit":"podcasts"},{"id":"1hwucwb","title":"Answer Me This! Returns!! ","subreddit":"podcasts"},{"id":"1hwzmqc","title":"Phi-4 Llamafied + 4 Bug Fixes + GGUFs, Dynamic 4bit Quants","subreddit":"LocalLLaMA"},{"id":"1hx80jl","title":"What’s a Song You Love That No One Talks About?","subreddit":"spotify"},{"id":"1hx99oi","title":"Former OpenAI employee Miles Brundage: \"o1 is just an LLM though, no reasoning infrastructure. The reasoning is in the chain of thought.\" Current OpenAI employee roon: \"Miles literally knows what o1 does.\"","subreddit":"LocalLLaMA"},{"id":"1hwmy39","title":"Phi-4 has been released","subreddit":"LocalLLaMA"},{"id":"1hwthrq","title":"Why I think that NVIDIA Project DIGITS will have 273 GB/s of memory bandwidth","subreddit":"LocalLLaMA"},{"id":"1hx8f7y","title":"Hello guys, what are your go to podcasts if you are into sports? Can you guys suggest any adventure sports podcasts you listen often? ","subreddit":"podcasts"},{"id":"1hx8nex","title":"\"rStar-Math demonstrates that small language models (SLMs) can rival or even surpass the math reasoning capability of OpenAI o1, without distillation from superior models. rStar-Math achieves this by exercising \"deep thinking\" through Monte Carlo Tree Search (MCTS).....\"","subreddit":"LocalLLaMA"}

Example response: {"1hwwvuz": 0.3, "1hx7421": 0.4, "1hx973s": 0.6, "1hwoegx": 0.4, "1hx60t4": 0.8, "1hxap5s": 0.4, "1hx5i8u": 0.5, "1hx5486": 0.2, "1hx6v4k": 0.3, "1hws1bv": 0.2, "1hwucwb": 0.2, "1hwzmqc": 0.6, "1hx80jl": 0.3, "1hx99oi": 0.6, "1hwmy39": 0.6, "1hwthrq": 0.6, "1hx8f7y": 0.3, "1hx8nex": 0.7}`
                },
                {
                    role: "user",
                    content: redditPosts
                }
            ],
            model: "llama3-70b-8192",
            temperature: 0.7,
            max_tokens: 4096,
            response_format: { type: "json_object" }
        });

        // console.debug('LLM RATING RESPONSE', completion.choices[0]?.message?.content);
        const parsed = parseRatingResponse(completion.choices[0]?.message?.content || '{}') || {};
        console.debug(`LLM TONE RATINGS`, JSON.stringify(parsed));
        return parsed;
    });
}

async function tagTopics(posts: RedditPost[]): Promise<Record<string, string[]>> {
    return retryRequest(async () => {
        const redditPosts = JSON.stringify(posts.map(post => ({
            id: post.data.id,
            title: post.data.title,
            subreddit: post.data.subreddit,
            url: post.data.url
        })), null, 0);

        const completion = await client.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Tag each post with 5-10 relevant topics. These should reflect the subject matter and/or the type of post. You may use the title, subreddit and URL.
Use lowercase, simple terms that capture the key themes.
You MUST return a valid JSON object with post IDs as keys and arrays of topic tags as values.
Example input: [{"id":"1hwwvuz","title":"This sums my experience with models on Groq","subreddit":"LocalLLaMA"}, {"id":"1hwoegx","title":"Valley Heat left a void in me","subreddit":"podcasts"}]
Example response: {"1hwwvuz": ["technology", "artificial intelligence", "large language models", "cloud computing",  "groq", "machine learning","generative ai"], "1hwoegx": ["podcast", "california", "review", "recommendations", "audio"]}`
                },
                {
                    role: "user",
                    content: redditPosts
                }
            ],
            model: "llama3-70b-8192",
            temperature: 0.7,
            max_tokens: 4096,
            response_format: { type: "json_object" }
        });


        const parsed = parseRatingResponse(completion.choices[0]?.message?.content || '{}') || {};
        console.debug(`LLM TOPIC TAGS`, JSON.stringify(parsed));
        return parsed;
    });
}

async function transformRedditPostsToPieces(posts: RedditPost[]): Promise<Piece[]> {
    const [tones, topics] = await Promise.all([
        rateTones(posts),
        tagTopics(posts)
    ]);

    // Get all topics arrays for batch processing
    const allTopics = posts.map(post => topics[post.data.id] || []);

    // Get projections for all topics in one batch
    const projections = await getTopicProjections(allTopics);

    const pieces = posts.map((post, index) => ({
        id: post.data.id,
        title: post.data.title,
        url: post.data.url,
        published_utc: new Date(post.data.created_utc * 1000).toISOString(),
        subreddit: post.data.subreddit,
        tone: tones[post.data.id] || 0.499999,
        topics: topics[post.data.id] || [],
        topicProjection: projections[index],
        source: 'reddit',
        author: post.data.author,
        score: post.data.score,
        num_comments: post.data.num_comments,
        upvote_ratio: post.data.upvote_ratio,
        preview: post.data.preview,
        is_video: post.data.is_video,
        post_hint: post.data.post_hint,
        thumbnail: post.data.thumbnail,
        thumbnail_width: post.data.thumbnail_width,
        thumbnail_height: post.data.thumbnail_height,
        permalink: post.data.permalink,
        domain: post.data.domain,
        selftext: post.data.selftext,
        selftext_html: post.data.selftext_html,
        is_self: post.data.is_self
    }));

    return pieces;
}

export const GET: RequestHandler = async ({ fetch }) => {
    try {
        const response = await fetch('https://oauth.reddit.com/user/mauriceapi/m/good_survey/?raw_json=1&count=100', {
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
            throw error(response.status, `Reddit API returned ${response.status}`);
        }

        const data = await response.json();

        if (!data?.data?.children?.length) {
            return json({
                pieces: [],
                warning: 'No Reddit posts found'
            });
        }

        if (data.data.children.length > 0) {
            console.debug('First item:', JSON.stringify(data.data.children[0].data));
        }

        const pieces = await transformRedditPostsToPieces(data.data.children);
        return json({ pieces });
    } catch (err: any) {
        console.error('Error fetching Reddit data:', err);
        throw error(500, err?.message || 'Failed to fetch Reddit data');
    }
}
