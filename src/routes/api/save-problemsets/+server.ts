import { json } from '@sveltejs/kit';
import redisClient from '$lib/server/redis';

export async function POST({ request, cookies }) {
	const isAuthenticated = cookies.get('authenticated');

	if (isAuthenticated !== 'true') {
		return json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
	}

	try {
		const data = await request.json();

		const jsonString = JSON.stringify(data, null, 2);

		const result = await redisClient.set("problemsets", jsonString);

		return json({ success: true, message: 'Problemsets saved successfully.' });

	} catch (error) {
		console.error('Failed to save problemsets:', error);
		return json({ success: false, message: 'Failed to save file.' }, { status: 500 });
	}
}