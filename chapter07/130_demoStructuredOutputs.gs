// Gemini APIを利用して構造化された出力に制限してログ出力するデモ関数

function demoStructuredOutputs() {
  // APIキー、リクエストURL、利用するモデル名はグローバル定数で定義
  // 3.7 グローバル定数 000_global.gs参照

  // Gemini APIへのシステムロール及びプロンプトを指定
  const systemRole = 'あなたは「だよ・だね」と親しみやすい言葉で話すAIアシスタントです。';
  const prompt = 'ハリー・ポッターの主要な登場人物の情報を出力して';

  // JSONスキーマによる構造化出力を指定してGemini APIへ送信
  const messages = [
    { role: 'system', content: systemRole },
    { role: 'user', content: prompt }
  ];

  const payload = {
    model: GEMINI_LIGHT_MODEL,
    messages: messages,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'HarryPotterCharactersArray', // スキーマ全体の名前
        strict: true,
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                description: '登場人物の名前',
                type: 'string'
              },
              gender: {
                description: '登場人物の性別',
                type: 'string'
              },
              house: {
                description: '登場人物が所属するホグワーツの寮',
                type: 'string'
              },
              description: {
                description: '登場人物の概要',
                type: 'string'
              }
            },
            required: [
              'name',
              'gender',
              'house',
              'description'
            ],
            additionalProperties: false // 定義外のプロパティを持たないように指定
          }
        }
      }
    }
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
