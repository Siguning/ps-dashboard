import { json, error } from '@sveltejs/kit';

export async function GET({ params }) {
	const { problemNumber } = params;

	if (!problemNumber || isNaN(parseInt(problemNumber))) {
		throw error(400, 'A valid problem number must be provided.');
	}

	const url = `https://www.acmicpc.net/problem/${problemNumber}`;

	try {
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
			}
		});

		if (!response.ok) {
			throw error(404, `Problem ${problemNumber} not found. (Status: ${response.status})`);
		}

		const html = await response.text();

		const titleMatch = html.match(/<title>(.*?)<\/title>/);

		const fullTitle = titleMatch && titleMatch[1] ? titleMatch[1] : '';

		const title = fullTitle.substring(fullTitle.indexOf(':') + 1);

		return json({ title });

	} catch (err) {
		console.error(`Failed to fetch or parse problem ${problemNumber}:`, err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, `An internal server error occurred while fetching the problem title.`);
	}
}
