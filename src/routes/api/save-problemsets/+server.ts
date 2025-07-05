import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export async function POST({ request, cookies }) {
	const isAuthenticated = cookies.get('authenticated');

	if (isAuthenticated !== 'true') {
		return json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
	}

	try {
		const data = await request.json();

		const jsonString = JSON.stringify(data, null, 2);

		const filePath = path.join(process.cwd(), 'static', 'problemsets.json');
		fs.writeFileSync(filePath, jsonString, 'utf8');

		return json({ success: true, message: 'Problemsets saved successfully.' });

	} catch (error) {
		console.error('Failed to save problemsets:', error);
		return json({ success: false, message: 'Failed to save file.' }, { status: 500 });
	}
}