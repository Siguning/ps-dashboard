import redisClient from '$lib/server/redis';

export async function load() {
	try {
		const problemsetsString = await redisClient.get('problemsets');

		if (!problemsetsString) {
			return { problemsets: [] };
		}

		const problemsets = JSON.parse(problemsetsString);

		return {
			problemsets: problemsets.problemsets,
		};

	} catch (error) {
		console.error('Failed to load data from Redis:', error);
		return { problemsets: [], error: 'Could not load data.' };
	}
}