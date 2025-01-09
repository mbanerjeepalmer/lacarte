import { pipeline } from '@huggingface/transformers';
import type { RequestHandler } from '@sveltejs/kit';


export const GET: RequestHandler = async ({ fetch, url }) => {
    const text = url.searchParams.get('text');
    if (!text) {
        return new Response('Missing text parameter', { status: 400 });
    }

    const pipe = await pipeline('text-generation', 'onnx-community/Llama-3.2-1B-Instruct',
        { dtype: 'int8' }
    );
    const response = await pipe(text);
    return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' }
    });
}