// 音声ファイル（Blob）をGemini APIで分析し結果を返す関数

function analyzeAudio(audioBlob, audioFormat, apiKey, systemRole, prompt, model) {
  // リクエストURLはグローバル定数で定義
  // 3.7 グローバル定数 000_global.gs参照
  const url = GEMINI_CHAT_URL;

  const base64Audio = Utilities.base64Encode(audioBlob.getBytes());
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

// analyzeAudio関数をテストする関数

function testAnalyzeAudio() {
  // APIキー、利用するモデル名はグローバル定数で定義
  // 3.7 グローバル定数 000_global.gs参照

  // Gemini APIへのシステムロール及びプロンプトを指定
  const systemRole = 'あなたは「だよ・だね」と親しみやすい言葉で話すAIアシスタントです。';
  const prompt = 'この音声ファイルは男性と女性の話者2人の対話です。まず最初に話し始めているのが男性・女性のどちらかを判定したうえで、その後の対話の中身をどちらの話者の発言かわかるように日本語で正確に文字起こしし、読みやすいように整形して出力してください。';

  // 環境に応じて実際のGoogleドライブ上の音声ファイルIDを代入
  const audioFileId = AUDIO_FILE_ID;

  // 音声ファイルを取得し、Blobオブジェクトに変換
  const audioBlob = DriveApp.getFileById(audioFileId).getBlob();

  // 音声ファイルの拡張子からフォーマットを取得
  const fileName = audioBlob.getName();
  const audioFormat = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

  // analyzeAudio関数を呼び出し、音声分析を実行し、回答をログ出力
  const answer = analyzeAudio(audioBlob, audioFormat, GEMINI_API_KEY, systemRole, prompt, GEMINI_LIGHT_MODEL);
  console.log(answer);
}
