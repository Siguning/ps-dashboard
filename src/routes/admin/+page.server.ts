import { fail } from '@sveltejs/kit';
import { ADMIN_PASSWORD } from '$env/static/private';
import redisClient from '$lib/server/redis';

const CORRECT_PASSWORD = ADMIN_PASSWORD;

export async function load({ cookies }) {
	const isAuthenticated = cookies.get('authenticated') === 'true';
	try {
		const problemsetsString = await redisClient.get('problemsets');

		if (!problemsetsString) {
			return {
				problemsets: [],
				isAuthenticated
			};
		}

		const problemsets = JSON.parse(problemsetsString);
		return {
			problemsets: problemsets.problemsets,
			isAuthenticated
		};

	} catch (error) {
		console.error('Failed to load data from Redis:', error);
		return { problemsets: [], error: 'Could not load data.' };
	}
}

export const actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		const password = data.get('password');
		if (password === CORRECT_PASSWORD) {
			cookies.set('authenticated', 'true', {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24
			});

			return { success: true };
		}

		return fail(401, { error: 'Invalid password.' });
	}
};
