import { describe, it, expect } from 'vitest';
import { getTopicProjection } from '$lib/embeddings';

describe('embeddings', () => {
	it('should generate projections between 0 and 1', async () => {
		const testCases = [
			{
				tags: ['technology', 'artificial intelligence', 'machine learning'],
				description: 'technical topics'
			},
			{
				tags: ['food', 'cooking', 'recipes'],
				description: 'cooking topics'
			},
			{
				tags: ['philosophy', 'ethics', 'morality'],
				description: 'philosophical topics'
			}
		];

		for (const testCase of testCases) {
			const projection = await getTopicProjection(testCase.tags);
			console.log(`Projection for ${testCase.description}:`, projection);

			// Test value is between 0 and 1
			expect(projection).toBeGreaterThanOrEqual(0);
			expect(projection).toBeLessThanOrEqual(1);
		}
	});

	it('should generate different values for different topics', async () => {
		const technical = await getTopicProjection(['technology', 'coding', 'software']);
		const arts = await getTopicProjection(['art', 'painting', 'creativity']);

		console.log('Technical projection:', technical);
		console.log('Arts projection:', arts);

		// They should be different values
		expect(technical).not.toBe(arts);
	});

	it('should handle empty and single tags', async () => {
		const empty = await getTopicProjection([]);
		const single = await getTopicProjection(['technology']);

		console.log('Empty tags projection:', empty);
		console.log('Single tag projection:', single);

		expect(empty).toBeGreaterThanOrEqual(0);
		expect(empty).toBeLessThanOrEqual(1);
		expect(single).toBeGreaterThanOrEqual(0);
		expect(single).toBeLessThanOrEqual(1);
	});
});
