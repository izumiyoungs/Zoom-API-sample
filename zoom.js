const axios = require('axios');

/**
 * Zoom Server-to-Server OAuth requires:
 * - Body: application/x-www-form-urlencoded with grant_type and account_id
 * - Authorization: Basic base64(client_id:client_secret)
 * @see https://developers.zoom.us/docs/internal-apps/s2s-oauth/
 */
async function getAccessToken() {
    const accountId = process.env.ZOOM_ACCOUNT_ID;
    if (!accountId) {
        throw new Error('ZOOM_ACCOUNT_ID is required. Find it in your Zoom app credentials (Developer Console).');
    }
    const params = new URLSearchParams();
    params.append('grant_type', 'account_credentials');
    params.append('account_id', accountId);

    const response = await axios.post('https://zoom.us/oauth/token', params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        auth: {
            username: process.env.ZOOM_CLIENT_ID,
            password: process.env.ZOOM_CLIENT_SECRET,
        },
    });
    return response.data.access_token;
}

async function createMeeting(options = {}) {
    const accessToken = await getAccessToken();
    const startTime = new Date();
    startTime.setMinutes(startTime.getMinutes() + 5); // 5 min from now

    const meetingData = {
        topic: options.topic || 'Meeting',
        type: options.type ?? 1,
        duration: options.duration ?? 30,
        start_time: options.start_time || startTime.toISOString(),
        agenda: options.agenda || '',
    };

    const response = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        meetingData,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data;
}

/**
 * Create a draft and send it to recipients via Zoom Mail API (email:write:send_draft:admin).
 * Endpoint can be overridden with ZOOM_MAIL_SEND_DRAFT_URL in .env.
 * @see https://developers.zoom.us/docs/api/rest/zoom-mail/
 */
async function sendDraftEmail(options) {
    const accessToken = await getAccessToken();
    const { to, subject, body, html } = options;
    const payload = {
        to: Array.isArray(to) ? to : [to],
        subject: subject || 'Meeting invitation',
        body: body || '',
        ...(html && { html }),
    };
    const baseUrl = 'https://api.zoom.us/v2';
    const path = process.env.ZOOM_MAIL_SEND_DRAFT_URL || `${baseUrl}/email/drafts/send`;
    const response = await axios.post(path, payload, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
}

module.exports = { createMeeting, sendDraftEmail };
