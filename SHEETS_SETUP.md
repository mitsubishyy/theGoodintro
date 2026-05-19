# Wiring `/apply` to a private Google Sheet + Gmail

The survey at `/apply` posts to `/api/apply` (same origin), which forwards
each submission **server-side** to a Google Apps Script Web App. That script:

1. appends a row to a private Google Sheet you own,
2. emails **you** (`isobelh874@gmail.com`) the answers on every submission,
3. emails the **respondent** a copy of their answers when they ask for one.

No third-party email service, no database. Everything runs free inside the
Google account that owns the sheet. About 5 minutes, once.

## 1. Create the Sheet

1. Go to <https://sheets.new> (signed in as **isobelh874@gmail.com**) and
   create a blank spreadsheet.
2. Name it e.g. `theGoodintro — Research`.
3. Leave it empty. The script writes the header row automatically.

## 2. Add the Apps Script

1. In the sheet: **Extensions → Apps Script**.
2. Delete any sample code, paste the script below, **Save**.
3. `NOTIFY_EMAIL` is already set to `isobelh874@gmail.com` — change it if you
   want notifications elsewhere.

```javascript
// theGoodintro /apply -> Google Sheet + Gmail
var NOTIFY_EMAIL = "isobelh874@gmail.com";

// Sheet columns (stable order; blanks are fine).
var HEADERS = [
  "submittedAt","fullName","title","company","charityAmount",
  "conflictOfInterest","conflictDetail","beyondCharity","beyondCharityOther",
  "needToSee","meetingsPerYear","alignMatters","questionnaireWilling",
  "shareWithVendor","mandatoryPutOff","wouldRefer","biggestConcern","anythingElse",
  "joinWhenReady","utmSource","utmMedium","utmCampaign",
  "wantsCopy","copyEmail"
];

// Friendly labels for the emails (order = email order).
var LABELS = [
  ["fullName","Name"],
  ["title","Title"],
  ["company","Company"],
  ["charityAmount","Charity amount worth their time"],
  ["conflictOfInterest","Charity a conflict of interest?"],
  ["conflictDetail","Conflict detail"],
  ["beyondCharity","What else would make it worth it"],
  ["beyondCharityOther","Other (what else)"],
  ["needToSee","What they'd need to see"],
  ["meetingsPerYear","Meetings per year"],
  ["alignMatters","Values vendor relevance"],
  ["questionnaireWilling","Would do the 5-min questionnaire"],
  ["shareWithVendor","OK to share answers with the vendor"],
  ["mandatoryPutOff","Mandatory questionnaire a dealbreaker"],
  ["wouldRefer","Would refer a peer"],
  ["biggestConcern","Biggest concern"],
  ["anythingElse","Anything else"],
  ["joinWhenReady","Would join when ready"],
  ["utmSource","Source"]
];

function fmt(obj) {
  var lines = [];
  for (var i = 0; i < LABELS.length; i++) {
    var key = LABELS[i][0], label = LABELS[i][1];
    var v = obj[key];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      lines.push(label + ": " + v);
    }
  }
  return lines.join("\n");
}

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
    // Record a row (full submission, or a copy-request marker row).
    var row = HEADERS.map(function (k) { return data[k] != null ? data[k] : ""; });
    sheet.appendRow(row);

    if (data.type === "copyRequest") {
      var answers = {};
      try { answers = JSON.parse(data.answersJson || "{}"); } catch (x) {}
      if (data.copyEmail) {
        MailApp.sendEmail({
          to: data.copyEmail,
          subject: "Your theGoodintro answers",
          body:
            "Thank you for taking the time. Here is a copy of what you shared:\n\n" +
            fmt(answers) +
            "\n\nNothing you shared is sold or made public.\n\n— theGoodintro"
        });
      }
    } else {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: "New theGoodintro response — " + (data.fullName || "") +
                 " (" + (data.company || "") + ")",
        body: fmt(data) + "\n\nSubmitted: " + (data.submittedAt || "")
      });
    }

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

## 3. Deploy as a Web App

1. Top right: **Deploy → New deployment**.
2. Gear next to "Select type" → **Web app**.
3. **Execute as: Me** · **Who has access: Anyone**.
4. **Deploy**, then **Authorize access**. The consent screen will now also
   ask to **send email as you** (because the script uses Gmail) — approve it.
5. Copy the **Web app URL** (`https://script.google.com/macros/s/…/exec`).

## 4. Give the site the URL

Send the Web app URL to me. I set it locally as `SHEETS_WEBHOOK_URL`, and you
add the same in **Vercel → Project → Settings → Environment Variables**
(`SHEETS_WEBHOOK_URL`, Production + Preview), then it goes live on the next
deploy.

## 5. Test

Submit a test response at `/apply`: a row should appear in the sheet and a
notification should hit `isobelh874@gmail.com`. Tick "Yes, send me a copy"
with an address to test the respondent email.

## Notes

- Change the script later → **Deploy → Manage deployments → edit → new
  version** (a new edit does not take effect until redeployed).
- Consumer Gmail sends ~100 emails/day via Apps Script — ample for validation.
- The form has a honeypot + per-IP rate limit against basic spam.
- To stop collecting, remove the `SHEETS_WEBHOOK_URL` env var.
