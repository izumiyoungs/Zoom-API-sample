const readline = require('readline');
require('dotenv').config();

const { createMeeting, sendDraftEmail } = require('./zoom.js');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
    return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
    console.log('Zoom Meeting CLI – create a meeting and email the link\n');

    const email = await ask('Enter attendee email: ');
    const trimmed = email.trim();
    if (!trimmed) {
        console.error('No email provided.');
        rl.close();
        process.exit(1);
    }

    try {
        console.log('Creating meeting...');
        const meeting = await createMeeting({
            topic: 'Meeting',
            agenda: `Meeting with ${trimmed}`,
        });

        const joinUrl = meeting.join_url;
        const topic = meeting.topic;

        console.log('Meeting created. Sending invitation via Zoom Mail...');

        try {
            await sendDraftEmail({
                to: trimmed,
                subject: `Meeting invitation: ${topic}`,
                body: `You're invited to a meeting.\n\nJoin here: ${joinUrl}\n\nTopic: ${topic}`,
                html: `<p>You're invited to a meeting.</p><p><strong>Join here:</strong> <a href="${joinUrl}">${joinUrl}</a></p><p><strong>Topic:</strong> ${topic}</p>`,
            });
            console.log(`Done. Invitation sent to ${trimmed}`);
        } catch (mailErr) {
            const res = mailErr.response;
            if (res && res.status === 404) {
                console.log('Zoom Mail send_draft endpoint not found (404). Share this link with the attendee:');
            } else if (res) {
                console.error('Mail API error:', res.status, res.data);
            } else {
                console.error('Mail error:', mailErr.message);
            }
        }
        console.log('Join link:', joinUrl);
    } catch (err) {
        const res = err.response;
        if (res) {
            console.error('Error:', res.status, res.statusText, res.data);
        } else {
            console.error('Error:', err.message);
        }
        process.exit(1);
    } finally {
        rl.close();
    }
}

main();
