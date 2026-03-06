import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Handle CORS preflight for API routes
	if (event.url.pathname.startsWith('/api/')) {
		if (event.request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
					'Access-Control-Allow-Headers': 'Content-Type'
				}
			});
		}
	}

	const response = await resolve(event);

	// Add CORS headers to all API responses
	if (event.url.pathname.startsWith('/api/')) {
		response.headers.set('Access-Control-Allow-Origin', '*');
		response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
		response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
	}

	return response;
};
