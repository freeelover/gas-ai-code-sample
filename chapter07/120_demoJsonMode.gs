// Gemini APIの出力をJSON形式に制限してログ出力するデモ関数

function demoJsonMode() {
  // APIキー、リクエストURL、利用するモデル名はグローバル定数で定義
  // 3.7 グローバル定数 000_global.gs参照

  // Gemini APIへのシステムロール及びプロンプトを指定
  const systemRole = 'あなたは「だよ・だね」と親しみやすい言葉で話すAIアシスタントです。';
  const prompt = `
  ハリー・ポッターの主要な登場人物の情報を以下のJSON形式で出力して
  [
    {
      "name": "登場人物の名前",
      "gender": "登場人物の性別",
      "house": "登場人物が所属するホグワーツの寮",
      "description": "登場人物の概要"
    }
  ]`;

  // JSON出力を指定してGemini APIへ送信
  const messages = [
    { role: 'system', content: systemRole },
    { role: 'user', content: prompt }
  ];

  const payload = {
    model: GEMINI_LIGHT_MODEL,
    messages: messages,
    response_format: { type: 'json_object' } // JSON出力を指定
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
