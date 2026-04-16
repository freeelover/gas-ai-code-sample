// Gemini APIを利用してFunction Callingを行い結果を出力するデモ関数

function demoFunctionCalling() {
  // APIキー、リクエストURL、利用するモデル名はグローバル定数で定義
  // 3.7 グローバル定数 000_global.gs参照

  // Gemini APIへのシステムロール及びプロンプトを指定
  const systemRole = 'あなたは「だよ・だね」と親しみやすい言葉で話すAIアシスタントです。';

  // プロンプト1. 昨日の受信メールを検索する
  const today = Utilities.formatDate(new Date(), 'JST', 'yyyy年MM月dd日'); // 今日の日付を文字列で取得
  const prompt = `今日は${today}です。昨日の受信メールは何件で、どのような内容のものがあった？`;

  // プロンプト2. カレンダーの予定を確認する
  // const prompt = '2025年の12月24日に梅田での飲み会に誘われているんだけれど、予定的に行けるかな？';

  // プロンプト3. Function Callingが不要な指示をする
  // const prompt = '太陽の光はなぜ暖かいの？';

  // ツール（関数）の定義
  const tools = [
    {
      type: 'function',
      function: {
        name: 'getGmailMessagesByQuery',
        description: '指定したGmail検索クエリに一致するメールの日時・件名・本文をオブジェクト配列で取得する関数',
        parameters: {
          type: 'object',
          properties: {
            searchQuery: {
              type: 'string',
              description: 'Gmailの検索クエリ'
            }
          },
          required: ['searchQuery']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'getCalendarEvents',
        description: 'Googleカレンダーの予定を取得する関数',
        parameters: {
          type: 'object',
          properties: {
            startDate: {
              type: 'string',
              format: 'date-time',
              description: '取得開始日時（ISO8601形式の文字列 例: 2024-06-19T09:00:00Z）'
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: '取得終了日時（ISO8601形式の文字列 例: 2024-06-19T09:00:00Z）'
            }
          },
          required: ['startDate', 'endDate']
        }
      }
    }
  ];

  // Gemini APIへ送信
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
    muteHttpExceptions: false
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

    // 実際に関数を呼び出してその結果を取得
    const info = this[toolName](args);
    console.log(info);

    // 取得した情報を文字列に変換
    const information = JSON.stringify(info);

    // 取得した情報をプロンプトに追加して、回答を出力
    // 4.2 テキスト生成を関数化する 040_askSimpleChat.gs 1-37行 参照
    const answer = askSimpleChat(GEMINI_API_KEY, systemRole, prompt + '補足情報：' + information, GEMINI_LIGHT_MODEL);
    console.log(answer);
  }
}

// Function Calling用に指定したGmail検索クエリに一致するメール情報を取得する関数

function getGmailMessagesByQuery(args) {
  // Function Callingで生成した引数オブジェクトから関数の実行に必要な引数を取得
  const searchQuery = args.searchQuery;

  // 指定したクエリでスレッドを検索する
  const threads = GmailApp.search(searchQuery);

  // 検索結果からメッセージを取得してオブジェクト配列に整形する
  const results = threads.flatMap(thread =>
    thread.getMessages().map(message => {
      const messageDate = message.getDate();
      const subject = message.getSubject();
      const body = message.getPlainBody();
      const messageInfo = {
        date: messageDate,
        subject: subject,
        body: body
      };
      return messageInfo;
    })
  );
  return results;
}

// Function Calling用にGoogleカレンダーの予定を取得する関数

function getCalendarEvents(args) {
  // 引数から値を取り出しDateオブジェクトに変換する
  const startDateString = args.startDate;
  const endDateString = args.endDate;
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);

  // デフォルトカレンダーを取得する
  const cal = CalendarApp.getDefaultCalendar();

  // 指定期間のイベントを取得する
  const events = cal.getEvents(startDate, endDate);

  // イベント情報をオブジェクト配列に変換する
  const eventObjs = events.map(event => {
    const eventObj = {
      id: event.getId(),
      title: event.getTitle(),
      description: event.getDescription(),
      location: event.getLocation(),
      start: event.getStartTime(),
      end: event.getEndTime(),
      attendees: event.getGuestList().map(guest => guest.getEmail())
    };
    return eventObj;
  });

  return eventObjs;
}
