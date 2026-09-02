# Google Sheets form integration

Both website forms write straight into one Google Spreadsheet:

| Form | Route | Tab |
|---|---|---|
| Membership application (`/join`) | `POST /api/join` | `Memberships` |
| Contact / query box (homepage Contact section) | `POST /api/contact` | `Queries` |

Tabs and their header rows are created automatically on the first submission.

## One-time setup

1. **Create the spreadsheet.** New Google Sheet, copy the ID out of the URL:
   `https://docs.google.com/spreadsheets/d/<THIS_PART>/edit`

2. **Create a service account.**
   - Go to https://console.cloud.google.com/ and create (or pick) a project.
   - APIs & Services > Library > enable **Google Sheets API**.
   - APIs & Services > Credentials > Create credentials > **Service account**.
   - Open the service account > Keys > Add key > **Create new key** > JSON. A JSON file downloads.

3. **Share the sheet with the service account.** In the JSON find `client_email`
   (looks like `something@project.iam.gserviceaccount.com`). Share the spreadsheet
   with that address as **Editor**.

4. **Set the env vars.** Locally, create `.env.local` (see `.env.example`):

   ```
   GOOGLE_SHEETS_ID=<spreadsheet id>
   GOOGLE_SERVICE_ACCOUNT_EMAIL=<client_email from the JSON>
   GOOGLE_PRIVATE_KEY="<private_key from the JSON, keep the \n escapes, wrap in quotes>"
   ```

   On Vercel add the same three under Project Settings > Environment Variables
   (Production + Preview + Development). Paste the private key with real line
   breaks or with `\n` escapes, both work.

5. Redeploy. Submit a test entry from `/join` and from the homepage contact box.

## Behaviour without credentials

If any of the three vars is missing the API routes fall back to appending to
`data/memberships.txt` / `data/queries.txt`, so local dev keeps working. That
fallback does not persist on Vercel, so production must have the env vars set.
