// イベント告知テキストから情報を抽出し、Googleカレンダーに予定を作成する関数

function createEventFromText(eventText) {
  // APIキー、リクエストURL、利用するモデル名はグローバル定数で定義
  // 3.7 グローバル定数 000_global.gs参照

  // Gemini APIへのシステムロール及びプロンプトを指定
  const systemRole = 'あなたはイベント情報を抽出する優秀なアシスタントです。';
  const prompt = `以下のイベント告知文から、イベント情報を抽出してください。日時は必ずYYYY-MM-DDTHH:MM:SSの形式で出力してください。\n\n${eventText}`;

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
        name: 'ExtractEventInfo',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            summary: {
              description: 'イベントのタイトルや件名',
              type: 'string'
            },
            location: {
              description: 'イベントの開催場所',
              type: 'string'
            },
            description: {
              description: 'イベントの詳細な説明やメモ',
              type: 'string'
            },
            startDateTime: {
              description: 'イベントの開始日時（ISO 8601形式:YYYY-MM-DDTHH:MM:SS）',
              type: 'string'
            },
            endDateTime: {
              description: 'イベントの終了日時（ISO 8601形式:YYYY-MM-DDTHH:MM:SS）',
              type: 'string'
            }
          },
          required: [
            'summary',
            'startDateTime',
            'endDateTime'
          ],
          additionalProperties: false
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
  const json = chat.choices[0].message.content;

  // 回答のJSON文字列をオブジェクトに変換
  const calendarEventInfo = JSON.parse(json);

  // デフォルトカレンダーオブジェクトを取得する
  const calendar = CalendarApp.getDefaultCalendar();

  // イベントのタイトルを取得
  const summary = calendarEventInfo.summary;

  // ISO文字列からDateオブジェクトを生成する
  const startDate = new Date(calendarEventInfo.startDateTime);
  const endDate = new Date(calendarEventInfo.endDateTime);

  // イベントの場所・説明を取得
  const location = calendarEventInfo.location;
  const description = calendarEventInfo.description;

  // カレンダーイベントを作成する
  calendar.createEvent(
    summary,
    startDate,
    endDate,
    {
      location,
      description
    }
  );
}

// createEventFromText関数をテストする関数

function testCreateEventFromText() {
  const sampleText = `
件名：【重要】新製品発表セミナー開催のお知らせ

関係者各位

拝啓　時下ますますご清栄のこととお慶び申し上げます。

この度、弊社では新製品「AIアシスト Ver.3.0」の発表セミナーを
下記のとおり開催する運びとなりました。

つきましては、ご多忙中とは存じますが、万障お繰り合わせの上、
ご出席賜りますようお願い申し上げます。

　　　　　　　　　　　　記

１．日時：2025年12月24日（水） 15:00～17:00
２．場所：弊社 第2研修室（東京都新宿区西新宿2-8-1 都庁前駅直結）
３．内容：新製品「AIアシスト Ver.3.0」の活用事例紹介、Q&Aセッション
４．参加費：無料
５．申込方法：ウェブサイトのフォームよりお申し込みください（11月15日締切）。

ご不明な点がございましたら、担当：鈴木（suzuki@example.com）まで
お気軽にお問い合わせください。

敬具

株式会社ＸＹＺ
担当：鈴木
`;
  createEventFromText(sampleText);
}
