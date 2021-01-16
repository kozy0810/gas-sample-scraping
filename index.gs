const BASE_URL = "https://startup-db.com";
const SHEET_ID = ""; // シートのIDを指定
const SHEET_NAME = ""; // 書き込むシート名を指定

function start() {
  const detailPageURLs = [];

  // 詳細ページのPathの取得
  for (let page = 1; page < 100; page++) {
    console.log("page: "+page);
    // クエリの条件（企業名昇順、資金調達額 100、表示件数 100件）
    let getURL = BASE_URL + "/ja/companies?employees=&established_at_from=&established_at_to=&funds_from=100&funds_to=&l=100&p="+ page +"&s=name+asc&stock_market=&utf8=%E2%9C%93"
    let html = UrlFetchApp.fetch(getURL).getContentText("UTF-8");
    let paths = Parser.data(html).from('<h1 class="p-corporate__name"><a href="').to('">').iterate();
    paths.forEach((path) => {
      detailPageURLs.push(BASE_URL+path);
    })

    // 次へページのリンクがなければbreak
    let nextBtn = html.match("icon fa-angle-right");
    if (!nextBtn) break;
    Utilities.sleep(1000);
  }
  detailPageURLs.forEach((url) => {
    insertToSheet(url)
    Utilities.sleep(1000);
  });
}

function insertToSheet(url) {
  console.log("取得ページ： "+url);
  let html = UrlFetchApp.fetch(url).getContentText("UTF-8");

  // 企業名
  let corpName = Parser.data(html).from('<h1 class="p-name">').to('</h1>').iterate();
  // 企業HP URL
  let corpURL = Parser.data(html).from('<dd class="p-col__body is-url">').to('</dd>').iterate();
  corpURL = corpURL[0].replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "")
  corpURL = corpURL.trim();
  // 調達額
  let fundingAmount = Parser.data(html).from('<td class="p-summary__number p-nowrap">').to('<span>').iterate();

  // スプレッドシートのIDを指定
  let spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  // 書き込むシート名を指定
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  // シートの最終行を取得
  let lastrow = sheet.getLastRow();
  // 最終行からデータを書き込む
  let recordrow = lastrow + 1;

  let today = new Date().toLocaleDateString();
  sheet.getRange("A" + recordrow).setValue(today);
  sheet.getRange("B" + recordrow).setValue(corpName);
  sheet.getRange("C" + recordrow).setValue(corpURL);
  sheet.getRange("D" + recordrow).setValue(fundingAmount);
  sheet.getRange("E" + recordrow).setValue(url);
}