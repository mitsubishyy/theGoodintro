# Wiring `/apply` to a private Google Sheet + Gmail

The survey at `/apply` posts to `/api/apply` (same origin), which forwards
each submission **server-side** to a Google Apps Script Web App. That script:

1. appends a row to a private Google Sheet you own,
2. emails **you** (`isobelh874@gmail.com`) the answers on every submission,
3. emails the **respondent** a polished copy of their answers when they ask.

No third-party email service, no database. Everything runs free inside the
Google account that owns the sheet.

## If you are updating an existing setup

You already deployed once. To apply a new version of this script:

1. Open the sheet → **Extensions → Apps Script**.
2. Select all the code, delete it, paste the script below, **Save**.
3. **Deploy → Manage deployments** → click the **pencil (Edit)** on your
   deployment → **Version: New version** → **Deploy**.
   - The Web app URL stays the same, so nothing else needs changing.
   - First redeploy after this update prompts for one new permission
     (UrlFetchApp, used to fetch the founder portrait from the site
     for the inline email signature). Click Allow.

> **Column set changed (2026-05).** The survey was reworked: several
> fields were removed (`conflictOfInterest`, `meetingsPerYear`,
> `alignMatters`, `mandatoryPutOff`, `biggestConcern`, `anythingElse`)
> and new ones added (`charityTheme`, `vendorMustProvide`, `guidance`,
> `utmContent`, plus `*Other` companions). Before submissions hit the
> new schema, **clear the sheet** (delete all rows including the
> header) so the script writes a fresh header row on the next
> submission. Otherwise existing rows will be misaligned with the new
> columns.

## First-time setup

1. At <https://sheets.new> (signed in as **isobelh874@gmail.com**) create a
   blank spreadsheet, name it e.g. `The Good Intro - Research`. Leave it empty.
2. **Extensions → Apps Script**, delete the sample, paste the script, **Save**.
3. **Deploy → New deployment** → gear → **Web app** →
   **Execute as: Me**, **Who has access: Anyone** → **Deploy**.
4. **Authorise access** (approve the sheet + send-email permissions; if you
   see "Google hasn't verified", that is normal for a personal script:
   **Advanced → Go to … (unsafe) → Allow**).
5. Copy the **Web app URL** (`https://script.google.com/macros/s/…/exec`) and
   send it to me to wire in (locally + Vercel env `SHEETS_WEBHOOK_URL`).

## The script

```javascript
// The Good Intro /apply -> Google Sheet + Gmail
var NOTIFY_EMAIL = "isobelh874@gmail.com";

var HEADERS = [
  "submittedAt","fullName","title","company","charityAmount",
  "charityTheme","charityThemeOther",
  "beyondCharity","beyondCharityOther",
  "vendorMustProvide","vendorMustProvideOther",
  "needToSee","needToSeeOther",
  "questionnaireWilling","shareWithVendor",
  "guidance","wouldRefer","joinWhenReady",
  "utmSource","utmMedium","utmCampaign","utmContent",
  "wantsCopy","copyEmail"
];

var LABELS = [
  ["fullName","Name"],
  ["title","Title"],
  ["company","Company"],
  ["charityAmount","Charity amount worth their time"],
  ["charityTheme","Cause(s) close to them"],
  ["charityThemeOther","Cause (specific)"],
  ["beyondCharity","What else would make it worth it"],
  ["beyondCharityOther","Other (what else)"],
  ["vendorMustProvide","What a vendor must provide to judge relevance"],
  ["vendorMustProvideOther","Vendor must provide (other)"],
  ["needToSee","What they'd need to see on the platform"],
  ["needToSeeOther","Need to see (other)"],
  ["questionnaireWilling","Would do the 5-min priorities step"],
  ["shareWithVendor","OK to share priorities with the vendor"],
  ["guidance","Guidance for building it"],
  ["wouldRefer","Would refer a peer"],
  ["joinWhenReady","Would join when the platform is ready"],
  ["utmSource","Source"]
];

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function fmt(obj) {
  var lines = [];
  for (var i = 0; i < LABELS.length; i++) {
    var k = LABELS[i][0], label = LABELS[i][1], v = obj[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      lines.push(label + ": " + v);
    }
  }
  return lines.join("\n");
}

// Brand wordmark: "The" and "Intro" in body colour, "Good" in emerald.
function wordmark(onDark) {
  var g = onDark ? "#43B27D" : "#1F7A52";
  var c = onDark ? "#F6F2E9" : "#1A1813";
  return '<span style="color:' + c + ';">The </span>' +
         '<span style="color:' + g + ';">Good</span>' +
         '<span style="color:' + c + ';"> Intro</span>';
}

function answerRows(obj) {
  var rows = "";
  for (var i = 0; i < LABELS.length; i++) {
    var k = LABELS[i][0], label = LABELS[i][1], v = obj[k];
    if (v === undefined || v === null || String(v).trim() === "") continue;
    rows +=
      '<tr><td style="padding:13px 0;border-bottom:1px solid #E6DFD2;">' +
        '<div style="font-size:11px;text-transform:uppercase;letter-spacing:0.13em;color:#1F7A52;">' +
          esc(label) +
        '</div>' +
        '<div style="margin-top:5px;font-size:15px;line-height:1.55;color:#1A1813;">' +
          esc(v) +
        '</div>' +
      '</td></tr>';
  }
  return rows;
}

function copyHtml(firstName, answers) {
  return [
'<!doctype html><html><body style="margin:0;padding:0;background-color:#F6F2E9;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Helvetica,Arial,sans-serif;color:#1A1813;">',
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F6F2E9;padding:32px 16px;"><tr><td align="center">',
'<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FCFAF4;border:1px solid #E6DFD2;border-radius:16px;overflow:hidden;">',
'<tr><td style="background-color:#1A1813;padding:22px 32px;">',
'<p style="margin:0;font-family:Georgia,\'Times New Roman\',serif;font-size:20px;letter-spacing:0.01em;">' + wordmark(true) + '</p>',
'<p style="margin:6px 0 0;font-size:11px;text-transform:uppercase;letter-spacing:0.18em;color:#43B27D;">Your answers</p>',
'</td></tr>',
'<tr><td style="padding:36px 32px 8px;">',
'<h1 style="margin:0;font-family:Georgia,\'Times New Roman\',serif;font-size:26px;line-height:1.3;font-weight:normal;color:#1A1813;">Thank you, ' + esc(firstName) + '.</h1>',
'<p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#6F675B;">Thanks for taking the time to help a stranger shape something <span style="color:#1F7A52;font-family:Georgia,\'Times New Roman\',serif;letter-spacing:0.01em;">Good</span>. If you ticked Yes on the last question, I\'ll be in touch soon. Looking forward to saying hi properly.</p>',
'</td></tr>',
'<tr><td style="padding:22px 32px 0;">',
'<p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:#1F7A52;">What you shared</p>',
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + answerRows(answers) + '</table>',
'</td></tr>',
'<tr><td style="padding:22px 32px 0;">',
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#E8F1EB;border-radius:14px;"><tr><td style="padding:20px 22px;">',
'<p style="margin:0;font-size:14px;line-height:1.6;color:#1A1813;">Your responses are private. They are never sold, shared with vendors, or published anywhere. You can ask me to delete them at any time by replying to this email.</p>',
'</td></tr></table>',
'</td></tr>',
'<tr><td style="padding:26px 32px 6px;">',
'<p style="margin:0 0 16px;font-family:Georgia,\'Times New Roman\',serif;font-size:17px;color:#1A1813;">Best,</p>',
'<table role="presentation" cellpadding="0" cellspacing="0"><tr>',
'<td style="vertical-align:middle;padding-right:14px;">',
'<div style="font-size:14px;line-height:1.4;color:#1A1813;"><strong>Issy Hardwick</strong></div>',
'<div style="font-size:13px;line-height:1.4;color:#6F675B;">Founder</div>',
'<div style="margin-top:4px;font-family:Georgia,\'Times New Roman\',serif;font-size:15px;">' + wordmark(false) + '</div>',
'</td>',
'<td style="vertical-align:middle;">',
'<img src="cid:issy" alt="Issy Hardwick" width="64" height="64" style="display:block;width:64px;height:64px;border-radius:50%;object-fit:cover;object-position:50% 0%;border:1px solid #E6DFD2;" />',
'</td>',
'</tr></table>',
'</td></tr>',
'<tr><td style="padding:20px 32px 28px;"><div style="border-top:1px solid #E6DFD2;padding-top:14px;">',
'<p style="margin:0;font-size:12px;line-height:1.6;color:#9A9183;">You are receiving this because you asked for a copy of your answers on The Good Intro. Invite only, Australia first.</p>',
'</div></td></tr>',
'</table></td></tr></table></body></html>'
  ].join("");
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
    if (data.type === "copyRequest") {
      // One row per person: find their submission row and fill in the
      // wantsCopy / copyEmail cells in place (do NOT add a new row).
      var wcCol = HEADERS.indexOf("wantsCopy") + 1;
      var ceCol = HEADERS.indexOf("copyEmail") + 1;
      var fnCol = HEADERS.indexOf("fullName") + 1;
      var coCol = HEADERS.indexOf("company") + 1;
      var nameV = String(data.fullName || "");
      var compV = String(data.company || "");
      var last = sheet.getLastRow();
      var updated = false;
      if (last >= 2) {
        var vals = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
        for (var r = vals.length - 1; r >= 0; r--) {
          if (String(vals[r][fnCol - 1]) === nameV &&
              String(vals[r][coCol - 1]) === compV &&
              String(vals[r][wcCol - 1]).trim() === "") {
            sheet.getRange(r + 2, wcCol).setValue("Yes");
            sheet.getRange(r + 2, ceCol).setValue(data.copyEmail || "");
            updated = true;
            break;
          }
        }
      }
      if (!updated) {
        sheet.appendRow(HEADERS.map(function (k) { return data[k] != null ? data[k] : ""; }));
      }
      var answers = {};
      try { answers = JSON.parse(data.answersJson || "{}"); } catch (x) {}
      if (data.copyEmail) {
        var first = String(answers.fullName || "").trim().split(" ")[0] || "there";
        var mailOptions = {
          to: data.copyEmail,
          subject: "Your answers, The Good Intro",
          htmlBody: copyHtml(first, answers),
          body:
            "Thanks for taking the time to help a stranger shape something Good. " +
            "If you ticked Yes on the last question, I'll be in touch soon. " +
            "Looking forward to saying hi properly.\n\n" +
            "Your answers:\n\n" +
            fmt(answers) +
            "\n\nYour responses are private and never sold or made public.\n\nIssy Hardwick\nFounder, The Good Intro"
        };
        try {
          var portrait = UrlFetchApp.fetch("https://thegoodintro.vercel.app/issy.jpg")
            .getBlob().setName("issy.jpg");
          mailOptions.inlineImages = { issy: portrait };
        } catch (imgErr) {
          // Image fetch failed; send the email without the inline photo.
        }
        MailApp.sendEmail(mailOptions);
      }
    } else {
      sheet.appendRow(HEADERS.map(function (k) { return data[k] != null ? data[k] : ""; }));
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: "New The Good Intro response: " + (data.fullName || "") +
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

## Notes

- Consumer Gmail sends ~100 emails/day via Apps Script, ample for validation.
- The form has a honeypot + per-IP rate limit against basic spam.
- To stop collecting, remove the `SHEETS_WEBHOOK_URL` env var in Vercel.
