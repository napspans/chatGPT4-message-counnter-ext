下記のコードはchatGPT4に対するメッセージ数をカウントするchrome拡張機能です。
仕様に従いコードを修正してください。

# 機能追加
- タイムスタンプリストが更新された際にhtml及びバッジの数値を更新するようにしてください。

background.js
```
// 定数の定義
const FILTER_URLS = ["https://chat.openai.com/backend-api/conversation"];
const MAX_TIMESTAMPS = 50;
const TIME_TO_COUNT = 3 * 60 * 60 * 1000;


// HTTPリクエストの監視設定
chrome.webRequest.onBeforeRequest.addListener(
  handlePostRequest,
  { urls: FILTER_URLS },
  ["requestBody"]
);

// 60秒（60000ミリ秒）ごとにupdateEveryMinuteを実行
setInterval(updateEveryMinute, 60000);

// 設定項目のデフォルト値
let showBadge = true;
let targetModel = "gpt-4";

// 初期設定の読み込み
chrome.storage.local.get(["showBadge", "targetModel"], (result) => {
  if (result.hasOwnProperty("showBadge")) {
    showBadge = result.showBadge;
  }
  if (result.hasOwnProperty("targetModel")) {
    targetModel = result.targetModel;
  }
});

// 設定が変更された時に変数を更新
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local") {
    let shouldUpdateBadge = false;

    if (changes.hasOwnProperty("showBadge")) {
      showBadge = changes.showBadge.newValue;
      shouldUpdateBadge = true;
    }
    if (changes.hasOwnProperty("targetModel")) {
      targetModel = changes.targetModel.newValue;
    }

    if (shouldUpdateBadge) {
      chrome.storage.local.get(['timestamps'], (result) => {
        const currentCount = result.timestamps ? result.timestamps.length : 0;
        
        if (showBadge) {
          updateBadge(currentCount);
        } else {
          chrome.action.setBadgeText({text: ""});
        }
      });
    }
  }
});

// 毎分実行する関数
function updateEveryMinute() {
  chrome.storage.local.get(['timestamps'], (result) => {
    let timestamps = result.timestamps || [];
    timestamps = updateTimestamps(timestamps,null);

    // 更新されたtimestampsを保存
    chrome.storage.local.set({timestamps});
  });
}



// POSTリクエストを処理する関数
function handlePostRequest(details) {
  if (details.method !== "POST") return;

  const body = decodeURIComponent(
    String.fromCharCode.apply(null, new Uint8Array(details.requestBody.raw[0].bytes))
  );

  if (body.includes(`"model":"${targetModel}"`)) {
    const timestamp = Date.now();
    saveTimestamp(timestamp);
  }
}

// タイムスタンプを保存する関数
function saveTimestamp(timestamp) {
  chrome.storage.local.get(['timestamps'], (result) => {
    let timestamps = result.timestamps || [];
    timestamps = updateTimestamps(timestamps, timestamp);
    
    // showBadgeがtrueならばバッジを更新、falseならばバッジを消す
    if (showBadge) {
      updateBadge(timestamps.length);
    } else {
      chrome.action.setBadgeText({text: ""});
    }

    chrome.storage.local.set({timestamps});
  });
}

// タイムスタンプの処理を行う関数（引数 newTimestamp はオプショナル）
function updateTimestamps(timestamps, newTimestamp) {
  if (newTimestamp) {
    timestamps.push(newTimestamp);
  }
  timestamps.sort();
  
  if (timestamps.length > MAX_TIMESTAMPS) {
    timestamps = timestamps.slice(-MAX_TIMESTAMPS);
  }

  const threshold = Date.now() - TIME_TO_COUNT;
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
  const textColor = (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? [0, 0, 0, 255] : [255, 255, 255, 255];
  
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
    "webRequestBlocking",
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
  ],
  "web_accessible_resources": [
    {
      "resources": ["popup.html", "popup.js"],
      "matches": ["<all_urls>"]
    }
  ]
}

```
popup.html
```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>
      body {
        width: 300px;
        height: 400px;
        margin: 20px;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <!-- メイン画面 -->
    <div id="main-view">
      <h1>Current Count: <span id="count"></span></h1>
      <button id="settings-button">設定</button>
      <div id="timestamps-list"></div>
    </div>
    
    <!-- 設定画面 -->
    <div id="settings-view" style="display:none;">
      <h1>設定</h1>
      <form id="settings-form">
        <label>
          バッジ表示:
          <input type="checkbox" id="show-badge">
        </label>
        <br>
        <label>
          検出するモデル:
          <select id="target-model">
            <option value="gpt-4">GPT-4</option>
            <option value="text-davinci">GPT-3</option>
          </select>
        </label>
      </form>
      <button id="back-button">戻る</button>
    </div>
  </body>
  <script src="popup.js"></script>
</html>
```

popup.js
```
document.addEventListener("DOMContentLoaded", () => {

  // タイムスタンプのリストを表示
  chrome.storage.local.get(['timestamps'], (result) => {
    const timestamps = result.timestamps || [];
    const count = timestamps.length;
    document.getElementById("count").textContent = count;

    // タイムスタンプのリストをHTMLで表示
    const timestampListDiv = document.getElementById("timestamps-list");
    timestampListDiv.innerHTML = timestamps.map((ts, index) => { // indexを使って順番を振る
      const date = new Date(ts);
      return `<div>${index + 1}. ${date.toLocaleString()}</div>`; // ここで `${index + 1}.` を追加
    }).join('');
  });

  // 設定を読み込む
  chrome.storage.local.get(['showBadge', 'targetModel'], (result) => {
    document.getElementById('show-badge').checked = result.showBadge ?? true;
    document.getElementById('target-model').value = result.targetModel ?? 'gpt-4';
  });

  // 設定画面表示
  document.getElementById('settings-button').addEventListener('click', () => {
    document.getElementById('main-view').style.display = 'none';
    document.getElementById('settings-view').style.display = 'block';
  });

  // 設定画面からメイン画面へ戻る
  document.getElementById('back-button').addEventListener('click', () => {
    document.getElementById('main-view').style.display = 'block';
    document.getElementById('settings-view').style.display = 'none';
  });

  // 設定保存
  document.getElementById('settings-form').addEventListener('change', () => {
    const showBadge = document.getElementById('show-badge').checked;
    const targetModel = document.getElementById('target-model').value;
    chrome.storage.local.set({ showBadge, targetModel });
  });
});

```