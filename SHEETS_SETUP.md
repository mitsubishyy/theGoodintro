# Wiring `/apply` to a private Google Sheet

The executive insights form at `/apply` posts to `/api/apply` (same origin),
which forwards each submission **server-side** to a Google Apps Script Web App
that appends one row to a Google Sheet you own. No third-party form service,
no database, and the data stays in a private Sheet only you can see.

This takes about 5 minutes, once.

## 1. Create the Sheet

1. Go to <https://sheets.new> and create a new spreadsheet.
2. Name it something like `TheBigIntro — Executive Research`.
3. Leave it empty. The script writes the header row automatically on the
   first submission.

## 2. Add the Apps Script

1. In the sheet: **Extensions → Apps Script**.
2. Delete any sample code and paste this in:

```javascript
// TheBigIntro /apply -> Google Sheet
// Columns are fixed and ordered so they stay stable even if a field is blank.
var HEADERS = [
  "submittedAt","fullName","email","title","company","companySize","industry",
  "charityAmount","conflictOfInterest","conflictDetail","beyondCharity",
  "outreachVolume","outreachToday","needToSee","meetingsPerYear","meetingLength",
  "joinWhenReady","alignMatters","questionnaireWilling","priorities",
  "relevantCategories","wouldRefer","impactProfile","biggestConcern",
  "anythingElse","utmSource","utmMedium","utmCampaign"
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }
    var data = JSON.parse(e.postData.contents);
    var row = HEADERS.map(function (k) { return data[k] != null ? data[k] : ""; });
    sheet.appendRow(row);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

3. **Save** (disk icon).

## 3. Deploy it as a Web App

1. Top right: **Deploy → New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Settings:
   - **Description:** `apply intake`
   - **Execute as:** **Me**
   - **Who has access:** **Anyone**  (this only allows POSTing rows; the
     Sheet itself stays private to you)
4. **Deploy**, then **Authorize access** and approve the Google permission
   prompt for your own account.
5. Copy the **Web app URL**. It looks like
   `https://script.google.com/macros/s/AKfyc.../exec`.

## 4. Give the site the URL

**Locally:** create `.env.local` (copy `.env.local.example`) and set:

```
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfyc.../exec
```

Restart `npm run dev`.

**On Vercel:** Project → **Settings → Environment Variables** → add
`SHEETS_WEBHOOK_URL` with the same value for **Production** and **Preview**,
then redeploy.

## 5. Test

Open `/apply`, submit a test response, and confirm a new row lands in the
Sheet. Until `SHEETS_WEBHOOK_URL` is set, the form still works but the
submission is only written to the server log (so you can preview the form
safely before going live).

## Notes

- If you change the script later, you must **Deploy → Manage deployments →
  edit → new version** for changes to take effect.
- The form has a hidden honeypot field and a 6-per-hour-per-IP rate limit to
  keep out basic spam.
- To stop collecting, just remove the `SHEETS_WEBHOOK_URL` env var.
