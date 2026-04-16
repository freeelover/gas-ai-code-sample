// 受信メールをAIで分析し必要なら下書きを作成する関数

function analyzeUnreadEmailsWithAI() {
  // 処理対象のメールを検索
  const threads = GmailApp.search('is:unread -is:starred newer_than:7d');

  // 処理対象のメールがない場合は処理を停止
  if (threads.length === 0) {
    console.log('処理対象のメールはありませんでした。');
    return;
  }
  console.log(`${threads.length}件の未読メールを処理します。`);

  // 各メールスレッドを順番に処理
  threads.forEach(thread => {
    // スレッド内の全メッセージを取得
    const messages = thread.getMessages();

    // 最後に受信したメッセージを取得
    const lastMessage = messages[messages.length - 1];

    // スレッドIDを取得
    const threadId = thread.getId();

    // 件名・本文・差出人を使用する
    const subject = lastMessage.getSubject();
    const body = lastMessage.getPlainBody().slice(0, 2000);
    const sender = lastMessage.getFrom();

    // AIにメール内容を渡し、どの関数を呼び出すべきか判断させる
    callAIForGmail(threadId, subject, body, sender);
  });
}

// メール情報を基にAIが判断したGmail操作を実行する関数

function callAIForGmail(threadId, subject, body, sender) {
  // Gemini APIへのシステムロール及びプロンプトを指定
  const systemRole = `
    あなたは優秀なメールアシスタントです。
    受信したメールの内容を分析し、以下の基準で次に取るべきアクションを判断してください。
    - 返信が必要なメール: 緊急性が高い、質問をされている、明らかに返信を求めている場合。
      -> 'createDraftAndStar'関数を呼び出してください。その際、丁寧な返信文案も生成してください。
    - 返信は不要だが重要なメール: 会議の招待、重要な通知のメールなど。
      -> 'starEmail'関数を呼び出してください。
    - 上記以外のメール: ニュースレター、広告、情報共有、自動通知など、とくに対応が不要なメール。
      -> 'markAsRead'関数を呼び出してください。
  `;

  const prompt = `
    以下のメールへの対応を判断してください。
    スレッドID: ${threadId}
    差出人: ${sender}
    件名: ${subject}
    本文:
    ${body}
  `;

  // ツール（関数）の定義
  const tools = [
    {
      type: 'function',
      function: {
        name: 'createDraftAndStar',
        description: '返信が必要なメールに対して、下書きを作成し、スレッドにスターを付けます。',
        parameters: {
          type: 'object',
          properties: {
            threadId: {
              type: 'string',
              description: 'GmailのスレッドID'
            },
            replyBody: {
              type: 'string',
              description: 'AIが生成した返信メールの本文'
            }
          },
          required: ['threadId', 'replyBody']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'starEmail',
        description: '返信は不要だが重要なメールにスターを付けます。',
        parameters: {
          type: 'object',
          properties: {
            threadId: {
              type: 'string',
              description: 'GmailのスレッドID'
            }
          },
          required: ['threadId']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'markAsRead',
        description: '重要でないメールを既読にします。',
        parameters: {
          type: 'object',
          properties: {
            threadId: {
              type: 'string',
              description: 'GmailのスレッドID'
            }
          },
          required: ['threadId']
        }
      }
    }
  ];

  // Gemini APIへリクエストを送信
  const messages = [
    { role: 'system', content: systemRole },
    { role: 'user', content: prompt }
  ];

  const payload = {
    model: GEMINI_LIGHT_MODEL,
    messages: messages,
    tools: tools
  };

  const params = {
    contentType: 'application/json',
    headers: { Authorization: `Bearer ${GEMINI_API_KEY}` },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true // エラー時に例外をスローしない
  };

  const responseBody = UrlFetchApp.fetch(GEMINI_CHAT_URL, params).getContentText();
  const chat = JSON.parse(responseBody);
  const message = chat.choices[0].message;

  // LLMがメッセージ回答を生成した場合には、その回答を出力
  if (message.hasOwnProperty('content')) {
    const answer = message.content;
    console.log(answer);
  }

  // 関数呼び出しが必要と判断された場合の処理
  if (message.hasOwnProperty('tool_calls')) {

    // 呼び出す関数名を取得
    const tool_calls = message.tool_calls[0];
    const toolName = tool_calls.function.name;
    console.log(toolName);

    // 関数に渡す引数を取得
    const arguments = tool_calls.function.arguments;
    const args = JSON.parse(arguments);
    console.log(args);

    // 実際に関数を呼び出して実行
    this[toolName](args);
  }
}

// 指定されたGmailスレッドに返信の下書きを作成し、スターを付ける関数

function createDraftAndStar(args) {
  // スレッドIDを使用してGmailスレッドを取得
  const thread = GmailApp.getThreadById(args.threadId);
  // 取得したスレッドに返信の下書きを作成
  thread.createDraftReply(args.replyBody);
  // スレッド内の最後に受信したメッセージにスターを付ける      
  const messages = thread.getMessages();
  const lastMessage = messages[messages.length - 1];
  lastMessage.star();
  console.log(`[完了] ID:${args.threadId} のスレッドに返信下書きを作成し、スターを付けました。`);
}

// 指定されたGmailスレッドにスターを付ける関数

function starEmail(args) {
  // スレッドIDを使用してGmailスレッドを取得
  const thread = GmailApp.getThreadById(args.threadId);
  // スレッド内の最後に受信したメッセージにスターを付ける      
  const messages = thread.getMessages();
  const lastMessage = messages[messages.length - 1];
  lastMessage.star();
  console.log(`[完了] ID:${args.threadId} のスレッドにスターを付けました。`);
}

// 指定されたGmailスレッドを既読にする関数

function markAsRead(args) {
  // スレッドIDを使用してGmailスレッドを取得
  const thread = GmailApp.getThreadById(args.threadId);
  // スレッドを既読にする
  thread.markRead();
  console.log(`[完了] ID:${args.threadId} のスレッドを既読にしました。`);
}
