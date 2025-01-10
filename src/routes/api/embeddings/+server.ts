import { featureExtraction } from '@huggingface/inference';
import { json } from '@sveltejs/kit';
import { HF_TOKEN } from '$env/static/private';


async function embedTagsBatch(tagsArray: string[][]) {
    try {
        const outputs = await Promise.all(
            tagsArray.map(tagList =>
                featureExtraction({ accessToken: HF_TOKEN, inputs: tagList, model: "sentence-transformers/all-MiniLM-L6-v2" })
                    .catch(e => {
                        console.error('Error embedding text:', tagList, e);
                        return null;
                    })
            )
        );
        console.debug('TAG EMBEDDING OUTPUTS:', outputs);
        console.debug('First output:', outputs[0]);
        console.debug('First output type:', typeof outputs[0]);
        if (outputs[0]) {
            console.debug('First output shape:', {
                length: outputs[0].length,
                firstElemType: typeof outputs[0][0],
                firstElemLength: Array.isArray(outputs[0][0]) ? outputs[0][0].length : 'N/A'
            });
        }
        if (outputs[1]) {
            console.debug('Second output shape:', {
                length: outputs[1].length,
                firstElemType: typeof outputs[1][0],
                firstElemLength: Array.isArray(outputs[1][0]) ? outputs[1][0].length : 'N/A'
            });
        }


        return outputs.map(output => {
            if (!output) {
                console.error('No output received');
                return 0.499999;
            }


            const meanValue = output.reduce((sum, vec) =>
                sum + vec.reduce((a: number, b: number) => a + b, 0) / vec.length
                , 0) / output.length;

            // Assumes typical embedding values between -1 and 1
            const normalized = (meanValue + 1) / 2;

            // Clamp to ensure we stay within [0,1]
            return Math.max(0, Math.min(1, normalized));
        });
    } catch (error) {
        console.error('Error in embedTagsBatch:', error);
        return new Array(tagsArray.length).fill(0.499999);
    }
}


export async function POST({ request }) {
    const { tags } = await request.json();
    const projections = await embedTagsBatch(tags);
    return json({ projections });
}