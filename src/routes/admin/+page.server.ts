import { fail } from '@sveltejs/kit';
import { ADMIN_PASSWORD } from '$env/static/private';

const CORRECT_PASSWORD = ADMIN_PASSWORD;

export function load({ cookies }) {
	const isAuthenticated = cookies.get('authenticated') === 'true';

	return {
		isAuthenticated
	};
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
