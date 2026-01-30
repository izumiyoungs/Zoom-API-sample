# Zoom-API-sample
a sample applicaiton using Zoom Integration

## CLI: create meeting and email attendee

Run `npm run cli` to create a Zoom meeting and send the join link to the attendee’s email using **Zoom’s Mail API** (send_draft: `email:write:send_draft:admin`).

1. In `.env` set **Zoom** credentials:
   - `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, `ZOOM_ACCOUNT_ID` (from [Zoom Developer Console](https://marketplace.zoom.us/)).

2. In the Zoom app’s **Scopes** page, enable:
   - **meeting:write:meeting** or **meeting:write:meeting:admin** (create meetings)
   - **email:write:send_draft:admin** (send invite email)

3. Run: `npm run cli` and enter the attendee’s email when prompted.

If the Zoom Mail send_draft endpoint returns 404 (path not in public docs), the CLI still creates the meeting and prints the join link so you can share it manually. You can set `ZOOM_MAIL_SEND_DRAFT_URL` in `.env` if you have the correct endpoint from Zoom.
