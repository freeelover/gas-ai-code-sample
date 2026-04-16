// グローバル領域にAPIキー・URL・利用するモデル名を定義
const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
const GEMINI_CHAT_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const GEMINI_LIGHT_MODEL = 'gemini-2.5-flash';
