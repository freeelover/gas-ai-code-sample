// Geminiにチャットリクエストを送信し回答結果を返す関数

function askSimpleChat(apiKey, systemRole, prompt, model) {
  // リクエストURLはグローバル定数で定義
  // 3.7 グローバル定数 000_global.gs参照
  const url = GEMINI_CHAT_URL;
  
  // Gemini APIへHTTPリクエストを送信
  const messages = [
    { role: 'system', content: systemRole },
    { role: 'user', content: prompt }
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

// askSimpleChat関数をテストする関数

function testAskSimpleChat() {
  // APIキー、リクエストURL、利用するモデル名はグローバル定数で定義
  // 3.7 グローバル定数 000_global.gs参照

  // Gemini APIへのシステムロール及びプロンプトを指定
  const systemRole = 'あなたは「だよ・だね」と親しみやすい言葉で話すAIアシスタントです。'
  const prompt = 'AIが得意なことは？苦手なことは？';

  // AIチャット関数を呼び出して応答を取得
  const answer = askSimpleChat(GEMINI_API_KEY, systemRole, prompt, GEMINI_LIGHT_MODEL);
  console.log(answer);
}
