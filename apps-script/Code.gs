/**
 * Grade Tracker – Google Sheets sync
 * 1. Open your Google Sheet → Extensions → Apps Script. Paste this whole file in.
 * 2. Change SECRET below to any password you like (you'll type the same one in the app).
 * 3. Deploy → New deployment → type "Web app" → Execute as: Me → Who has access: Anyone → Deploy.
 * 4. Copy the Web app URL (ends in /exec) into the app's Settings → Google Sheet.
 */
const SECRET = 'change-me';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.key !== SECRET) return json({ ok: false, error: 'Wrong sync password' });
    if (body.action !== 'save') return json({ ok: false, error: 'Unknown action' });
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    writeTable(ss, 'Overview', body.tables.overview);
    writeTable(ss, 'Modules', body.tables.modules);
    writeTable(ss, 'Assessments', body.tables.assessments);
    saveRaw(ss, body.data);
    return json({ ok: true, savedAt: new Date().toISOString() });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  const p = e.parameter || {};
  if (p.key !== SECRET) return json({ ok: false, error: 'Wrong sync password' });
  if (p.action === 'load') return json({ ok: true, data: loadRaw(SpreadsheetApp.getActiveSpreadsheet()) });
  return json({ ok: true, hello: 'Grade Tracker sync is running' });
}

function writeTable(ss, name, rows) {
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clearContents();
  if (!rows || !rows.length) return;
  const width = Math.max.apply(null, rows.map(r => r.length));
  const grid = rows.map(r => r.concat(Array(width - r.length).fill('')));
  sh.getRange(1, 1, grid.length, width).setValues(grid);
  sh.getRange(1, 1, 1, width).setFontWeight('bold').setBackground('#eef0f3');
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, width);
}

// Full app data is kept on a hidden tab so the app can restore from the sheet.
function saveRaw(ss, data) {
  const sh = ss.getSheetByName('_app_data') || ss.insertSheet('_app_data');
  sh.clearContents();
  const s = JSON.stringify(data);
  const chunks = [];
  for (let i = 0; i < s.length; i += 40000) chunks.push([s.slice(i, i + 40000)]);
  sh.getRange(1, 1, chunks.length, 1).setValues(chunks);
  sh.hideSheet();
}

function loadRaw(ss) {
  const sh = ss.getSheetByName('_app_data');
  if (!sh || sh.getLastRow() === 0) return null;
  const s = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(r => r[0]).join('');
  return s ? JSON.parse(s) : null;
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
