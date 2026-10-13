const PIXEL_ID = process.env.META_PIXEL_ID || '726718726244956';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || 'v26.0';

function json(response, statusCode, payload) {
    response.statusCode = statusCode;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(payload));
}

function getClientIp(request) {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (typeof forwardedFor === 'string' && forwardedFor.length) {
        return forwardedFor.split(',')[0].trim();
    }

    return request.socket && request.socket.remoteAddress;
}

function getRequestBody(request) {
    if (typeof request.body === 'string') {
        try {
            return JSON.parse(request.body);
        } catch {
            return {};
        }
    }

    return typeof request.body === 'object' && request.body !== null ? request.body : {};
}

module.exports = async function handler(request, response) {
    if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        return json(response, 405, { error: 'Method not allowed' });
    }

    if (!ACCESS_TOKEN) {
        return json(response, 500, { error: 'Missing META_ACCESS_TOKEN' });
    }

    const body = getRequestBody(request);
    const eventId = typeof body.event_id === 'string' ? body.event_id : `purchase-${Date.now()}`;
    const eventSourceUrl = typeof body.event_source_url === 'string' ? body.event_source_url : '';

    const userData = {
        client_user_agent: request.headers['user-agent'] || '',
        client_ip_address: getClientIp(request)
    };

    if (typeof body.fbp === 'string' && body.fbp) {
        userData.fbp = body.fbp;
    }

    if (typeof body.fbc === 'string' && body.fbc) {
        userData.fbc = body.fbc;
    }

    const metaPayload = {
        data: [
            {
                event_name: 'Purchase',
                event_time: Math.floor(Date.now() / 1000),
                event_id: eventId,
                action_source: 'website',
                event_source_url: eventSourceUrl,
                user_data: userData
            }
        ]
    };

    const metaResponse = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metaPayload)
        }
    );

    const metaResult = await metaResponse.json().catch(() => ({}));

    if (!metaResponse.ok) {
        return json(response, metaResponse.status, {
            error: 'Meta CAPI request failed',
            details: metaResult
        });
    }

    return json(response, 200, { ok: true });
};
