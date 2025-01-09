import { pipeline, type Pipeline } from '@huggingface/transformers';

let featureExtractor: Pipeline | null = null;

export async function initializeEmbeddings() {
    if (!featureExtractor) {
        featureExtractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return featureExtractor;
}

export async function embedTagsBatch(tagsArray: string[][]): Promise<number[]> {
    try {
        const extractor = await initializeEmbeddings();


        const texts = tagsArray.map(tags => tags.join(' '));
        const outputs = await Promise.all(
            texts.map(text =>
                extractor(text, { pooling: 'mean', normalize: true })
                    .catch(e => {
                        console.error('Error embedding text:', text, e);
                        return null;
                    })
            )
        );


        return outputs.map(output => {
            if (!output) {
                console.error('No output:', output);
                return 0.5
            };

            const embeddings = Array.from(output.data as Float32Array);
            const meanEmbedding = embeddings.reduce((sum: number, val: number) => sum + val, 0) / embeddings.length;
            return Math.max(0, Math.min(1, (meanEmbedding + 1) / 2));
        });
    } catch (error) {
        console.error('Error in embedTagsBatch:', error);
        return new Array(tagsArray.length).fill(0.5);
    }
}

export async function getTopicProjection(tags: string[]): Promise<number> {
    const [projection] = await embedTagsBatch([tags]);
    return projection;
}

// Utility function for batch processing
export async function getTopicProjections(tagsArray: string[][]): Promise<number[]> {
    return embedTagsBatch(tagsArray);
} 