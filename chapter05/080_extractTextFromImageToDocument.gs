// 画像内のテキストを抽出し、Googleドキュメントに出力する関数

function extractTextFromImageToDocument() {
  // APIキー、利用するモデル名はグローバル定数で定義
  // 3.7 グローバル定数 000_global.gs参照

  // 画像ファイルのIDを指定
  const imageFileId = MOVIE_POSTER_FILE_ID;

  // Gemini APIへのシステムロール及びプロンプトを指定
  const systemRole = 'あなたは画像からテキストを正確に読み取るAIアシスタントです。';
  const prompt = 'この画像に書かれている文字を全て書き出してください。';

  // 画像ファイルを取得
  const file = DriveApp.getFileById(imageFileId);
  const blob = file.getBlob();

  // analyzeImages関数で画像を分析しテキストを取得
  const extractedText = analyzeImages([blob], GEMINI_API_KEY, systemRole, prompt, GEMINI_LIGHT_MODEL);

  // 新たにGoogle ドキュメントを作成
  const docTitle = 'GeminiAPIによる画像解析'
  const doc = DocumentApp.create(docTitle);
  const body = doc.getBody();

  // テキストの書き込み
  body.appendParagraph('--- 画像から抽出したテキスト ---');
  body.appendParagraph(extractedText);

  // 保存
  doc.saveAndClose();

  // 新しく作ったドキュメントのURLをログに出す
  console.log('新しいドキュメントが作成されました→ ' + doc.getUrl());
}
