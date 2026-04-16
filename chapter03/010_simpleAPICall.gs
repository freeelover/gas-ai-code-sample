// 郵便番号に基づいて住所情報を取得しコンソールに出力する関数

function simpleAPICall() {
  const zipCode = '1040061'; // 任意の郵便番号を設定
  const url = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipCode}`;
  const response = UrlFetchApp.fetch(url).getContentText();
  const obj = JSON.parse(response);

  // results配列の最初の要素から住所情報を取り出す
  const result = obj.results[0];

  console.log(`都道府県名: ${result.address1}`);
  console.log(`市区町村名: ${result.address2}`);
  console.log(`町域名: ${result.address3}`);
}
