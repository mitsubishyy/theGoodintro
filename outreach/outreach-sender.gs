// theGoodintro outreach SENDER — runs entirely from a Google Sheet, like the
// survey. It reads each recipient row, builds that person's unique one-click
// Yes / No links, and sends them the cold email via your Gmail. Responses are
// recorded by the separate "Outreach Yes/No" sheet (the web app you already
// deployed) — this script only sends.
//
// SHEET LAYOUT (first row = headers, exactly these columns A–F):
//   A: first_name   B: name   C: email   D: company   E: status   F: sentAt
// Leave status / sentAt blank; the script fills them after a successful send
// and skips any row already marked "Sent".
//
// SETUP: paste this into Extensions > Apps Script on the send sheet, set the
// three CONFIG values below, Save, then reload the sheet. An "Outreach" menu
// appears. No deployment needed — this script only sends, it doesn't receive.

// ── CONFIG ───────────────────────────────────────────────────────────
var RSVP_SECRET = "ICls7UN2yjVxJ4ojEuKBnOkEd8wi5tPYopwYFeOwtzU="; // MUST match Vercel
var BASE_URL    = "https://thegoodintro.vercel.app";              // your live site
var CAMPAIGN    = "outreach-1";       // tags every response in your Yes/No sheet
var SUBJECT     = "A meeting that funds a charity you choose";
var FROM_NAME   = "Issy, theGoodintro";
var TEST_EMAIL  = "issy@thegoodintros.com"; // where "Send a test to me" goes
// ─────────────────────────────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Outreach")
    .addItem("Send a test to me", "sendTestToMe")
    .addItem("Send to unsent rows", "sendCampaign")
    .addToUi();
}

// base64url with no padding — matches lib/rsvp.ts in the app.
function b64url(bytesOrString) {
  return Utilities.base64EncodeWebSafe(bytesOrString).replace(/=+$/, "");
}

function signToken(name, email, company) {
  var payload = { n: name || "", e: email, c: company || "", iat: Math.floor(Date.now() / 1000) };
  var body = b64url(JSON.stringify(payload));
  var sig = b64url(Utilities.computeHmacSha256Signature(body, RSVP_SECRET));
  return body + "." + sig;
}

function links(name, email, company) {
  var t = signToken(name, email, company);
  var q = "&c=" + encodeURIComponent(CAMPAIGN);
  return {
    accept: BASE_URL + "/r?a=yes&t=" + t + q,
    decline: BASE_URL + "/r?a=no&t=" + t + q,
  };
}

function emailHtml(firstName, accept, decline) {
  var hi = firstName ? firstName : "there";
  return [
'<div>',
'<p>Hi ' + hi + ',</p>',
'<p>I\'m Issy, founder of theGoodintro. I\'m building an invite-only network where senior leaders take a small number of genuinely relevant meetings, and every meeting sends $1,000 to a charity they choose.</p>',
'<p>I\'d like you to be one of the first executives. There\'s no platform to learn and nothing to fill in. If you\'re open to it, I\'ll call for five minutes to set you up, and from there the introductions come to you by email, one at a time, only when they\'re a real fit.</p>',
'<p>Are you in?</p>',
'<table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0;"><tr>',
'<td style="padding-right:10px;"><a href="' + accept + '" style="display:inline-block;background-color:#1F7A52;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:15px;padding:12px 26px;border-radius:6px;">Yes, I\'m interested</a></td>',
'<td><a href="' + decline + '" style="display:inline-block;background-color:#ffffff;color:#1a1a1a;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:15px;padding:11px 25px;border-radius:6px;border:1px solid #cccccc;">Not for me</a></td>',
'</tr></table>',
'<p>One tap is all it takes, and that\'s the whole idea. Accepting is exactly as easy as the giving will be: every meeting you take sends $1,000 to a charity you choose.</p>',
'<p>Warmly,</p>',
'</div>'
  ].join("");
}

function emailText(firstName, accept, decline) {
  var hi = firstName ? firstName : "there";
  return "Hi " + hi + ",\n\n" +
    "I'm Issy, founder of theGoodintro. I'm building an invite-only network where senior leaders take a small number of genuinely relevant meetings, and every meeting sends $1,000 to a charity they choose.\n\n" +
    "I'd like you to be one of the first executives. There's no platform to learn and nothing to fill in. If you're open to it, I'll call for five minutes to set you up.\n\n" +
    "Are you in?\n\n" +
    "  Yes, I'm interested:  " + accept + "\n" +
    "  Not for me:          " + decline + "\n\n" +
    "Warmly,\nIssy";
}

// Your real Gmail signature. GmailApp does NOT attach it automatically, so we
// fetch it once via the Gmail service and append it. Requires the Gmail
// advanced service: in the script editor, click Services (+), add "Gmail API".
// If it isn't enabled, this returns "" and emails just send without a
// signature (no error).
var _sigCache = null;
function gmailSignature() {
  if (_sigCache !== null) return _sigCache;
  try {
    var me = Session.getActiveUser().getEmail();
    var sendAs = (Gmail.Users.Settings.SendAs.list("me").sendAs) || [];
    var primary = sendAs.filter(function (s) { return s.isPrimary; })[0] ||
                  sendAs.filter(function (s) { return s.sendAsEmail === me; })[0];
    _sigCache = (primary && primary.signature) ? primary.signature : "";
  } catch (e) {
    _sigCache = ""; // Gmail service not enabled, or no signature set.
  }
  return _sigCache;
}

function sendOne(firstName, name, email, company) {
  var l = links(name || firstName, email, company);
  var sig = gmailSignature();
  var html = emailHtml(firstName, l.accept, l.decline) + (sig ? '<br>' + sig : '');
  GmailApp.sendEmail(email, SUBJECT, emailText(firstName, l.accept, l.decline), {
    htmlBody: html,
    name: FROM_NAME,
  });
}

function sendTestToMe() {
  sendOne("Issy", "Issy Hardwick", TEST_EMAIL, "theGoodintro");
  SpreadsheetApp.getUi().alert("Test sent to " + TEST_EMAIL + ". Check your inbox, then click Yes to confirm it records.");
}

function sendCampaign() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var last = sheet.getLastRow();
  if (last < 2) { ui.alert("No recipients found. Add rows under the header first."); return; }

  var data = sheet.getRange(2, 1, last - 1, 6).getValues(); // A–F
  var toSend = data.filter(function (r) { return String(r[2]).trim() && String(r[4]).trim().toLowerCase() !== "sent"; }).length;
  if (toSend === 0) { ui.alert("Nothing to send. Every row with an email is already marked Sent."); return; }

  var resp = ui.alert("Send to " + toSend + " recipient(s)?", ui.ButtonSet.YES_NO);
  if (resp !== ui.Button.YES) return;

  var sent = 0;
  for (var i = 0; i < data.length; i++) {
    var row = i + 2;
    var firstName = String(data[i][0]).trim();
    var name = String(data[i][1]).trim();
    var email = String(data[i][2]).trim();
    var company = String(data[i][3]).trim();
    var status = String(data[i][4]).trim().toLowerCase();
    if (!email || status === "sent") continue;
    try {
      sendOne(firstName, name, email, company);
      sheet.getRange(row, 5).setValue("Sent");
      sheet.getRange(row, 6).setValue(new Date());
      sent++;
      Utilities.sleep(500); // gentle pacing
    } catch (err) {
      sheet.getRange(row, 5).setValue("Error: " + err);
    }
  }
  ui.alert("Done. Sent " + sent + " email(s).");
}
