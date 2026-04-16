// IDで指定された音声ファイルをGemini APIを使用して解析し結果をログに出力する関数

function demoAnalyzeAudio() {
  // APIキー、リクエストURL、利用するモデル名はグローバル定数で定義
  // 3.7 グローバル定数 000_global.gs参照

  // 音声ファイルのIDを指定
  const audioFileId = AUDIO_FILE_ID;

  // Gemini APIへのシステムロール及びプロンプトを指定
  const systemRole = 'あなたは「だよ・だね」と親しみやすい言葉で話すAIアシスタントです。';
  const prompt = 'この音声ファイルの内容を日本語で簡潔に要約してください。';

  // 音声ファイルを取得しBase64形式にエンコードする
  const file = DriveApp.getFileById(audioFileId);
  const blob = file.getBlob();
  const base64Audio = Utilities.base64Encode(blob.getBytes());

  // 音声ファイルの拡張子からフォーマットを取得
  const fileName = blob.getName();
  const audioFormat = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

  // 音声ファイルをGemini APIへ送信する
  const content = [
    {
      type: 'text',
      text: prompt
    },
    {
      type: 'input_audio',
      input_audio: {
        data: base64Audio,
        format: audioFormat
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
