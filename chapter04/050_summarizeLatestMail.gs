// Gmailの最新メールを取得しGemini APIで要約してログ出力する関数

function summarizeLatestMail() {
  // APIキー、利用するモデル名はグローバル定数で定義
  // 3.7 グローバル定数 000_global.gs参照

  // Gemini APIへのシステムロール及びプロンプトを指定
  const systemRole = 'あなたは要約の得意なAIアシスタントです。メールの本文を簡潔に日本語で要約してください。';
  const prompt = '以下のメール本文を要約してください。\n\n';

  // 受信トレイから最新のスレッドを1件取得
  const threads = GmailApp.getInboxThreads(0, 1);
  // 最初のスレッドから全てのメッセージを取得
  const messages = threads[0].getMessages();
  // 最新（スレッドの最後）のメッセージを取得
  const latestMail = messages[messages.length - 1];
  // メッセージのプレーンテキスト形式の本文を取得する
  const mailBody = latestMail.getPlainBody();

  // 要約結果をログに出力
  const summary = askSimpleChat(GEMINI_API_KEY, systemRole, prompt + mailBody, GEMINI_LIGHT_MODEL);
  console.log(summary);
}
