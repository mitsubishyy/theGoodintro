# One-click RSVP for cold outreach

This is **separate from the public marketing site.** It is the machinery behind
the Accept / Decline buttons in cold emails you send to executives. Nothing
here is linked from the site nav or footer, the pages are `noindex`, and the
responses land in their **own** Google Sheet (not the `/apply` research sheet).
It happens to be deployed inside the same Next.js app for convenience — no new
infra, and the links inherit the brand styling — but it is its own contained
feature.

## How it works

```
Gmail mail-merge          your site                Google Sheet
─────────────────         ────────────────         ─────────────
[ Yes ] ─ link with ───▶  /r?a=yes&t=…  ──▶ POST ──▶ appends a row
          a signed token  shows a branded   /api/rsvp  + emails you
[ No ]  ─ link ────────▶  "thank you" page
```

- Each recipient gets a **unique signed link** (no login, no account). The
  token in the link proves who they are; it can't be forged or edited.
- Clicking lands on a branded confirmation page that records the response.
  The write happens on a background POST, **not** on the link's GET — so
  corporate inbox link-scanners that silently pre-open URLs can't log a false
  "interested" against someone who never clicked.
- The response is **reversible**: the page lets them flip Yes/No if they
  misclick.
- "Yes" just captures interest and shows a warm confirmation. You follow up by
  hand (a five-minute call). No calendar or charity is collected here.

## Files

| File | What it does |
|---|---|
| [`lib/rsvp.ts`](lib/rsvp.ts) | Signs / verifies the per-recipient token (HMAC) |
| [`app/api/rsvp/route.ts`](app/api/rsvp/route.ts) | Records a click, forwards to the Sheet |
| [`app/r/page.tsx`](app/r/page.tsx) + `rsvp-client.tsx` | The branded landing page |
| [`scripts/make-rsvp-links.mjs`](scripts/make-rsvp-links.mjs) | Turns your recipient list into links |

## One-time setup

### 1. Make a signing secret

```
openssl rand -base64 32
```

Put the result in `.env.local` as `RSVP_SECRET=…` **and** in the Vercel project
env (Production + Preview). It must be identical in both, and identical to
whatever you pass when generating links.

### 2. Make the RSVP Google Sheet

Same idea as `SHEETS_SETUP.md`, but its own spreadsheet so the columns don't
collide with the `/apply` form.

1. At <https://sheets.new> (signed in as **issy@thegoodintros.com**) create a
   blank spreadsheet, name it e.g. `theGoodintro Outreach RSVPs`.
2. **Extensions → Apps Script**, delete the sample, paste the script below,
   **Save**.
3. **Deploy → New deployment** → gear → **Web app** → **Execute as: Me**,
   **Who has access: Anyone** → **Deploy**.
4. Authorise access (approve the sheet + send-email permissions; the
   "Google hasn't verified" screen is normal — **Advanced → Go to … → Allow**).
5. Copy the **Web app URL** and set it as `RSVP_WEBHOOK_URL` in `.env.local`
   and Vercel.

### The script

```javascript
// theGoodintro cold-outreach RSVP -> Google Sheet + Gmail notify
var NOTIFY_EMAIL = "issy@thegoodintros.com";

var HEADERS = ["respondedAt", "name", "email", "company", "response", "campaign"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }
    sheet.appendRow(HEADERS.map(function (k) { return data[k] != null ? data[k] : ""; }));

    GmailApp.sendEmail(
      NOTIFY_EMAIL,
      data.response + " from " + (data.name || data.email) + " (" + (data.company || "") + ")",
      "Response: " + data.response + "\n" +
        "Name: " + (data.name || "") + "\n" +
        "Email: " + (data.email || "") + "\n" +
        "Company: " + (data.company || "") + "\n" +
        "Campaign: " + (data.campaign || "") + "\n" +
        "When: " + (data.respondedAt || "")
    );

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

## Sending a campaign

1. Make a CSV of recipients with a header row. At minimum an `email` column;
   `name` and `company` are used if present:

   ```
   name,email,company
   Jane Allen,jane.allen@hexagon.com.au,Hexagon Bank
   ```

2. Generate the links:

   ```
   RSVP_SECRET=… node scripts/make-rsvp-links.mjs recipients.csv --campaign=may-cfo-2026 > links.csv
   ```

   `links.csv` is your original rows plus `accept_url` and `decline_url`
   columns. (Pass `--base=https://thegoodintro.vercel.app` while the custom
   domain isn't live yet, so the links point at the working deployment.)

3. Paste `links.csv` into your Gmail mail-merge sheet and use the
   `{{accept_url}}` / `{{decline_url}}` merge fields as the `href` of two
   buttons in the email. A button in email is just a styled link — see the
   markup below.

### Suggested line near the buttons

Tie the one tap to the giving, so the ease they feel accepting is the ease
they expect from donating. A short line just under the buttons:

> One tap is all it takes, and that's the whole idea. Accepting is exactly as
> easy as the giving will be: every meeting you take sends **$1,000** to a
> charity you choose.

The "Yes" landing page repeats this beat ("Notice how easy that was? Giving is
just as effortless."), so the message lands twice without feeling repetitive.

### Email button markup

Most mail-merge tools accept pasted HTML. Two buttons that survive Gmail /
Outlook:

```html
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
  <td style="padding-right:10px;">
    <a href="{{accept_url}}"
       style="display:inline-block;background:#1F7A52;color:#ffffff;
              text-decoration:none;font-family:Arial,Helvetica,sans-serif;
              font-size:15px;font-weight:600;padding:13px 28px;border-radius:999px;">
      Yes, I'm interested
    </a>
  </td>
  <td>
    <a href="{{decline_url}}"
       style="display:inline-block;background:#ffffff;color:#1A1813;
              text-decoration:none;font-family:Arial,Helvetica,sans-serif;
              font-size:15px;font-weight:600;padding:12px 27px;border-radius:999px;
              border:1px solid #C9C0B0;">
      Not for me
    </a>
  </td>
</tr></table>
```

## Notes

- Responses appear in the sheet and email you on every click.
- Same Gmail sending limits as the survey (~1,500/day on Workspace).
- To stop collecting, remove `RSVP_WEBHOOK_URL` in Vercel (links then no-op
  gracefully and log only).
