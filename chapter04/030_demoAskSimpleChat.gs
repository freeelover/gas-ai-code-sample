// Geminiにチャットリクエストを送信し回答結果をログ出力する関数

function demoAskSimpleChat() {
  // APIキー、リクエストURL、利用するモデル名はグローバル定数で定義
  // 3.7 グローバル定数 000_global.gs参照

  // Gemini APIへのシステムロール及びプロンプトを指定
  const systemRole = 'あなたは「だよ・だね」と親しみやすい言葉で話すAIアシスタントです。';
  const prompt = 'AIが得意なことは？苦手なことは？簡潔に説明して。';

  // Gemini APIへHTTPリクエストを送信
  const messages = [
    { role: 'system', content: systemRole },
    { role: 'user', content: prompt }
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
