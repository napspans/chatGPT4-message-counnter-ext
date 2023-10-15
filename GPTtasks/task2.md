下記のコードはchatGPT4に対するメッセージ数をカウントするchrome拡張機能です。
仕様に従いコードを修正してください。

# 設定機能追加
- 設定画面の追加
- バッジ表示のオン・オフ
- 検出するモデルの変更
  - ```if (body.includes('"model":"gpt-4')) {```
  - "gpt-4" または "gpt-3"
background.js
```
// 定数の定義
const FILTER_URLS = ["https://chat.openai.com/backend-api/conversation"];
const MAX_TIMESTAMPS = 50;
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

// HTTPリクエストの監視設定
chrome.webRequest.onBeforeRequest.addListener(
  handlePostRequest,
  { urls: FILTER_URLS },
  ["requestBody"]
);

// POSTリクエストを処理する関数
function handlePostRequest(details) {
  if (details.method !== "POST") return;

  const body = decodeURIComponent(
    String.fromCharCode.apply(null, new Uint8Array(details.requestBody.raw[0].bytes))
  );
  
  if (body.includes('"model":"gpt-4')) {
    const timestamp = Date.now();
    saveTimestamp(timestamp);
  }
}

// タイムスタンプを保存する関数
function saveTimestamp(timestamp) {
  chrome.storage.local.get(['timestamps'], (result) => {
    let timestamps = result.timestamps || [];
    timestamps = cleanupTimestamps(timestamps, timestamp);
    updateBadge(timestamps.length);
    chrome.storage.local.set({timestamps});
  });
}

// タイムスタンプの処理を行う関数
function cleanupTimestamps(timestamps, newTimestamp) {
  timestamps.push(newTimestamp);
  timestamps.sort();
  
  if (timestamps.length > MAX_TIMESTAMPS) {
    timestamps = timestamps.slice(-MAX_TIMESTAMPS);
  }

  const threshold = Date.now() - THREE_HOURS_MS;
  return timestamps.filter((ts) => ts > threshold);
}

// グラデーション風のバッジ背景色とテキスト色を計算する関数
function calculateGradientColors(count) {
  let r, g, b;

  if (count <= 30) {
    // 単色: 緑 (R: 127, G: 255, B: 0)
    r = 127;
    g = 255;
    b = 0;
  } else if (count <= 40) {
    // 緑からオレンジへのグラデーション (R: 127-255, G: 255-110, B: 0)
    r = Math.floor(127 + (255 - 127) * ((count - 30) / (40 - 30)));
    g = Math.floor(255 - (255 - 110) * ((count - 30) / (40 - 30)));
    b = 0;
  } else if (count <= 45) {
    // オレンジから赤へのグラデーション (R: 255, G: 110-50, B: 0)
    r = 255;
    g = Math.floor(110 - (110 - 50) * ((count - 40) / (45 - 40)));
    b = 0;
  } else if (count <= 50) {
    // 単色: 赤 (R: 255, G: 50, B: 0)
    r = 255;
    g = 50;
    b = 0;
  }
  

  // RGBA形式に変換
  const bgColor = [r, g, b, 255];
  // 文字色を自動調整
  const textColor = (r * 0.299 + g * 0.587 + b * 0.114) > 106 ? [0, 0, 0, 255] : [255, 255, 255, 255];
  
  return [bgColor, textColor];
}

// バッジのスタイルを更新する関数
function updateBadge(count) {
  chrome.action.setBadgeText({text: count.toString()});

  const [bgColor, textColor] = calculateGradientColors(count);
  chrome.action.setBadgeBackgroundColor({color: bgColor});
  if (chrome.action.setBadgeTextColor) {
    chrome.action.setBadgeTextColor({color: textColor});
  }
}
```

manifest.json
```
{
  "manifest_version": 3,
  "name": "ChatGPT-4 Message Counter",
  "version": "1.0",
  "description": "Counts the number of messages sent to ChatGPT-4.",
  "permissions": [
    "webRequest",
    "storage"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "128": "images/icon128.png"
    }
  },
  "host_permissions": [
    "https://chat.openai.com/*"
  ]
}
```
popup.html
```
<!DOCTYPE html>
<html>
  <body>
    <h1>Current Count: <span id="count"></span></h1>
  </body>
  <script src="popup.js"></script>
</html>

```