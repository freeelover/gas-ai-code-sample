// URLで指定された画像をGemini APIを使用して解析し結果をログに出力する関数

function demoAnalyzeImageFromUrl() {
  // APIキー、リクエストURL、利用するモデル名はグローバル定数で定義
  // 3.7 グローバル定数 000_global.gs参照

  // Gemini APIへのシステムロール及びプロンプトを指定
  const systemRole = 'あなたは「だよ・だね」と親しみやすい言葉で話すAIアシスタントです。';
  const prompt = 'この画像には何が写っていますか？';

  // 解析対象の画像URLを指定する
  const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Apple-3040132_640.jpg';

  // 画像のURLからをBlobオブジェクトを取得しBase64形式にエンコードする
  const blob = UrlFetchApp.fetch(imageUrl).getBlob();
  const mimeType = blob.getContentType();
  const base64Image = Utilities.base64Encode(blob.getBytes());
  
  // Data URIスキームを利用してリクエストボディに渡す
  const dataUrl = `data:${mimeType};base64,${base64Image}`;
  const content = [
    {
      type: 'text',
      text: prompt
    },
    {
      type: 'image_url',
      image_url: {
        url: dataUrl
      }
    }
  ];
  const messages = [
    { role: 'system', content: systemRole },
    { role: 'user', content: content }
  ];
  const payload = {
    model: GEMINI_LIGHT_MODEL,
    messages: messages,
  };
  const params = {
    contentType: 'application/json',
    headers: { Authorization: `Bearer ${GEMINI_API_KEY}` },
    payload: JSON.stringify(payload),
    muteHttpExceptions: false
  };
  const responseBody = UrlFetchApp.fetch(GEMINI_CHAT_URL, params).getContentText();
  const chat = JSON.parse(responseBody);
  const answer = chat.choices[0].message.content;
  console.log(answer);
}
