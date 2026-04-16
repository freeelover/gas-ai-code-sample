// Gemini APIからモデル一覧を取得する関数

function getGeminiModels() {
  // 環境に応じて実際のGemini APIキーを代入してください
  const apiKey = GEMINI_API_KEY;
  const url = 'https://generativelanguage.googleapis.com/v1beta/openai/models';
  const params = {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiKey}` },
    muteHttpExceptions: false
  };
  const response = UrlFetchApp.fetch(url, params);
  const modelList = response.getContentText();
  console.log('モデル一覧: ' + modelList);
}
