// 画像（Blob配列）をGemini APIで分析し結果を返す関数

function analyzeImages(imageBlobs, apiKey, systemRole, prompt, model) {
  // リクエストURLはグローバル定数で定義
  // 3.7 グローバル定数 000_global.gs参照
  const url = GEMINI_CHAT_URL;

  const dataUrls = imageBlobs.map(blob => {
    const mimeType = blob.getContentType();
    const base64Image = Utilities.base64Encode(blob.getBytes());
    return `data:${mimeType};base64,${base64Image}`;
  });
  const content = [{
    type: 'text',
    text: prompt
  }];
  dataUrls.forEach(dataUrl => {
    content.push({
      type: 'image_url',
      image_url: { url: dataUrl }
    });
  });
  const messages = [
    { role: 'system', content: systemRole },
    { role: 'user', content: content }
  ];
  const payload = {
    model: model,
    messages: messages,
  };
  const params = {
    contentType: 'application/json',
    headers: { Authorization: `Bearer ${apiKey}` },
    payload: JSON.stringify(payload),
    muteHttpExceptions: false
  };
  const responseBody = UrlFetchApp.fetch(url, params).getContentText();
  const chat = JSON.parse(responseBody);
  const answer = chat.choices[0].message.content;
  return answer;
}

// analyzeImages関数をテストする関数

function testAnalyzeImages() {
  // APIキー、リクエストURL、利用するモデル名はグローバル定数で定義
  // 3.7 グローバル定数 000_global.gs参照

  const systemRole = 'あなたは「だよ・だね」と親しみやすい言葉で話すAIアシスタントです。'
  const prompt = 'それぞれの画像の共通点と異なる点を教えて。';

  // 環境に応じて実際のGoogleドライブ上の画像ファイルIDを代入
  const imageId01 = IMAGE_FILE_ID_01;
  const imageId02 = IMAGE_FILE_ID_02;

  // 画像ファイルを取得し、Blobオブジェクトに変換
  const imageBlob01 = DriveApp.getFileById(imageId01).getBlob();
  const imageBlob02 = DriveApp.getFileById(imageId02).getBlob();

  // 取得したBlobオブジェクトを配列にまとめる
  const imageBlobs = [imageBlob01, imageBlob02];

  // analyzeImages関数を呼び出し、画像分析を実行し、回答をログ出力
  const answer = analyzeImages(imageBlobs, GEMINI_API_KEY, systemRole, prompt, GEMINI_LIGHT_MODEL);
  console.log(answer);
}
