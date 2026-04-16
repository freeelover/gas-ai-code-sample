// PDFのサムネイル画像を分析する関数

function testAnalyzePdfThumbnail() {
  // APIキー、リクエストURL、利用するモデル名はグローバル定数で定義
  // 3.7 グローバル定数 000_global.gs参照

  // Gemini APIへのシステムロール及びプロンプトを指定
  const systemRole = 'あなたは「だよ・だね」と親しみやすい言葉で話すAIアシスタントです。';
  const prompt = 'この画像の内容を要約して';

  // 環境に応じて実際のGoogleドライブ上のPDFファイルIDを代入
  const pdfId = PDF_FILE_ID_01;

  // PDFファイルをサムネイル画像に変換し、画像分析を実行
  const file = DriveApp.getFileById(pdfId);
  const blob = file.getThumbnail();
  const imageBlobs = [blob];
  const answer = analyzeImages(imageBlobs, GEMINI_API_KEY, systemRole, prompt, GEMINI_LIGHT_MODEL);
  console.log(answer);
}
