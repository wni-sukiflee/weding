/**
 * RSVP backend สำหรับการ์ดแต่งงาน (Asyah & Sukiflee)
 * ──────────────────────────────────────────────────────────────
 * หน้าที่:
 *   1) รับข้อมูลตอบรับจากหน้าเว็บ (doPost) แล้วบันทึกลงชีต "ตอบรับ"
 *   2) สรุปจำนวน "มาได้ / มาไม่ได้" และสร้างกราฟอัตโนมัติในชีต "สรุป"
 *
 * วิธีติดตั้ง: ดูไฟล์ apps-script/README.md (ทำครั้งเดียว)
 */

var RESP_SHEET = 'ตอบรับ';     // ชีตเก็บข้อมูลดิบ
var SUMMARY_SHEET = 'สรุป';    // ชีตสรุป + กราฟ
var YES = 'มาได้';
var NO = 'มาไม่ได้';

/** เมนู RSVP ในแถบเครื่องมือของชีต */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('RSVP')
    .addItem('ตั้งค่าชีต + สร้างกราฟ', 'setupSheet')
    .addToUi();
}

/** รับข้อมูลจากหน้าเว็บแล้วบันทึก 1 แถว */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return json({ ok: false, error: 'busy' });
  }
  try {
    var data = parseBody(e);
    var resp = String(data.response || '').toLowerCase();
    var label = (resp === 'yes' || resp === 'มาได้' || resp === YES) ? YES : NO;
    var name = String(data.name || '').slice(0, 120);
    var guests = parseInt(data.guests, 10);
    if (isNaN(guests) || guests < 1) guests = 1;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(RESP_SHEET);
    if (!sh) sh = setupSheet();

    sh.appendRow([new Date(), name, label, guests]);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** เปิด Web app URL ตรง ๆ ในเบราว์เซอร์เพื่อเช็คยอดปัจจุบัน */
function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(RESP_SHEET);
  var yes = 0, no = 0;
  if (sh && sh.getLastRow() > 1) {
    var rows = sh.getRange(2, 3, sh.getLastRow() - 1, 2).getValues(); // C:สถานะ, D:จำนวน
    rows.forEach(function (r) {
      var n = parseInt(r[1], 10) || 1;
      if (r[0] === YES) yes += n; else if (r[0] === NO) no += n;
    });
  }
  return json({ ok: true, comingGuests: yes, notComing: no });
}

/** สร้าง/รีเซ็ตหัวคอลัมน์ ชีตสรุป และกราฟ — รันครั้งเดียวก็พอ */
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── ชีตเก็บข้อมูลดิบ ──
  var sh = ss.getSheetByName(RESP_SHEET);
  if (!sh) sh = ss.insertSheet(RESP_SHEET);
  sh.getRange(1, 1, 1, 4)
    .setValues([['เวลา', 'ชื่อ', 'สถานะ', 'จำนวนท่าน']])
    .setFontWeight('bold');
  sh.setFrozenRows(1);
  sh.setColumnWidth(1, 160);
  sh.setColumnWidth(2, 200);

  // ── ชีตสรุป ──
  var sum = ss.getSheetByName(SUMMARY_SHEET);
  if (!sum) sum = ss.insertSheet(SUMMARY_SHEET);
  sum.clear();
  sum.getCharts().forEach(function (c) { sum.removeChart(c); });

  sum.getRange('A1:B1').setValues([['สถานะ', 'จำนวนคน']]).setFontWeight('bold');
  sum.getRange('A2').setValue(YES);
  sum.getRange('A3').setValue(NO);
  sum.getRange('B2').setFormula("=SUMIF('" + RESP_SHEET + "'!C:C, A2, '" + RESP_SHEET + "'!D:D)");
  sum.getRange('B3').setFormula("=SUMIF('" + RESP_SHEET + "'!C:C, A3, '" + RESP_SHEET + "'!D:D)");
  sum.getRange('A5').setValue('รวมทั้งหมด').setFontWeight('bold');
  sum.getRange('B5').setFormula('=B2+B3').setFontWeight('bold');
  sum.setColumnWidth(1, 120);

  // ── กราฟวงกลมเทียบสัดส่วน ──
  var chart = sum.newChart()
    .asPieChart()
    .addRange(sum.getRange('A2:B3'))
    .setOption('title', 'สัดส่วนผู้ตอบรับ: มาได้ vs มาไม่ได้')
    .setOption('legend', { position: 'right' })
    .setOption('pieSliceText', 'value-and-percentage')
    .setOption('colors', ['#8aa878', '#d18d8b']) // มาได้ = เขียว, มาไม่ได้ = ชมพู
    .setOption('width', 460)
    .setOption('height', 320)
    .setPosition(1, 4, 10, 0) // วางที่คอลัมน์ D ของชีตสรุป
    .build();
  sum.insertChart(chart);

  SpreadsheetApp.getActiveSpreadsheet().toast('ตั้งค่าชีตและสร้างกราฟเรียบร้อยแล้ว', 'RSVP', 5);
  return sh;
}

// ── helpers ──
function parseBody(e) {
  if (e && e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (err) {}
  }
  return (e && e.parameter) ? e.parameter : {};
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
