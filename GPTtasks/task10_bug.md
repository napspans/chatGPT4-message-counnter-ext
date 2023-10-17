chatGPT4に対するメッセージ数をカウントするchrome拡張機能を作っています。
popup.htmlの設定から検出も出るを切り替える機能を追加したのですが、
GPT4に対するメッセージはうまくカウントされますが、GPT3に対するメッセージがカウントされません。なぜですか？

GPT4リクエストfetch
```
fetch("https://chat.openai.com/backend-api/conversation", {
...,
  "body": "{...,\"model\":\"gpt-4\",...}",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});
```

GPT3リクエストfetch
```
fetch("https://chat.openai.com/backend-api/conversation", {
  ...,
  "body": "{...,\"model\":\"text-davinci-002-render-sha\",...}",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});
```

background.js
```
const FILTER_URLS = ["https://chat.openai.com/backend-api/conversation"];

// 設定項目のデフォルト値
let config = {
  showBadge: true,
  targetModel: "gpt-4",
  maxTimestamps: 50,
  timeToCount: 3 * 60 * 60 * 1000
};

// 初期設定
initializeConfig();

// Event listeners
chrome.webRequest.onBeforeRequest.addListener(handlePostRequest, { urls: FILTER_URLS }, ["requestBody"]);
chrome.storage.onChanged.addListener(handleConfigChange);
chrome.tabs.onUpdated.addListener(handleTabUpdate);

// 初期設定の読み込みとタイマーの設定
function initializeConfig() {
  chrome.storage.local.get(Object.keys(config), (result) => {
    for (const [key, value] of Object.entries(result)) {
      config[key] = value;
    }
  });
}

// POSTリクエストを処理する関数
function handlePostRequest(details) {
  if (details.method !== "POST") return;

  const body = decodeURIComponent(String.fromCharCode.apply(null, new Uint8Array(details.requestBody.raw[0].bytes)));
  if (body.includes(`"model":"${config.targetModel}"`)) {
    const timestamp = Date.now();
    saveAndUpdateTimestamps(timestamp);
  }
}

// 設定が変更された時に変数を更新
function handleConfigChange(changes, namespace) {
  if (namespace !== "local") return;

  let shouldUpdateBadge = false;
  for (const [key, { newValue }] of Object.entries(changes)) {
    config[key] = newValue;
    if (key === "showBadge") {
      shouldUpdateBadge = true;
    }
  }

  if (shouldUpdateBadge) {
    updateBadgeFromStorage();
  }
}

// タブが開かれたまたは更新されたときにタイムスタンプリストを更新する関数
function handleTabUpdate(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab && tab.url && tab.url.includes('chat.openai.com')) {
    saveAndUpdateTimestamps(null);
  }
}


// バッジのスタイルを更新する関数
function updateBadgeFromStorage() {
  chrome.storage.local.get(['timestamps'], (result) => {
    const currentCount = result.timestamps ? result.timestamps.length : 0;
    if (config.showBadge) {
      updateBadge(currentCount);
    } else {
      chrome.action.setBadgeText({text: ""});
    }
  });
}

// タイムスタンプを追加保存、UI更新する関数
function saveAndUpdateTimestamps(newTimestamp) {
  chrome.storage.local.get(['timestamps'], (result) => {
    let timestamps = result.timestamps || [];
    timestamps = updateTimestamps(timestamps, newTimestamp);
    chrome.storage.local.set({ timestamps });
    updateUI(timestamps);
  });
}

// タイムスタンプの処理を行う関数（引数 newTimestamp はオプショナル）
function updateTimestamps(timestamps, newTimestamp) {
  // 第二引数からあればリストに追加
  if (newTimestamp) {
    timestamps.push(newTimestamp);
  }
  timestamps.sort();
  // 個数制限処理
  if (timestamps.length > config.maxTimestamps) {
    timestamps = timestamps.slice(-config.maxTimestamps);
  }
  // 時間制限処理
  const threshold = Date.now() - config.timeToCount;
  return timestamps.filter((ts) => ts > threshold);
}

// グラデーション風のバッジ背景色とテキスト色を計算する関数
function calculateGradientColors(count) {
  let r, g, b;

  if (count <= config.maxTimestamps * 0.5) {
    // 単色: 緑 (R: 127, G: 255, B: 0)
    r = 127;
    g = 255;
    b = 0;
  } else if (count <= config.maxTimestamps * 0.7) {
    // 緑からオレンジへのグラデーション (R: 127-255, G: 255-110, B: 0)
    r = Math.floor(127 + (255 - 127) * ((count - 30) / (40 - 30)));
    g = Math.floor(255 - (255 - 110) * ((count - 30) / (40 - 30)));
    b = 0;
  } else if (count <= config.maxTimestamps * 0.8) {
    // オレンジから赤へのグラデーション (R: 255, G: 110-50, B: 0)
    r = 255;
    g = Math.floor(110 - (110 - 50) * ((count - 40) / (45 - 40)));
    b = 0;
  } else if (count <= config.maxTimestamps * 0.9) {
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

// UIを更新する関数(バッジ、html)
function updateUI(timestamps) {
  const count = timestamps.length;
  if (config.showBadge) {
    updateBadge(count);
  } else {
    chrome.action.setBadgeText({text: ""});
  }
  // ここでポップアップがアクティブかどうかを確認
  chrome.runtime.sendMessage({type: "CHECK_POPUP_ACTIVE"}, (response) => {
    if(chrome.runtime.lastError) {
      // エラーがあれば、何もしない
      return;
    }
    if(response && response.popupActive) {
      // ポップアップがアクティブな場合のみ、メッセージを送信
      chrome.runtime.sendMessage({type: "UPDATE_UI", count, timestamps});
    }
  });
  
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
      <h1>メッセージ数: <span id="count"></span></h1>
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
        <br>
        <label>
          最大タイムスタンプ数:
          <input type="number" id="max-timestamps" min="1">
        </label>
        <br>
        <label>
          カウント期間 (秒):
          <input type="number" id="time-to-count" min="1">
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

  // background.jsからのリスト更新メッセージを受け取る
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "CHECK_POPUP_ACTIVE") {
      sendResponse({popupActive: true});
    }
    if (message.type === "UPDATE_UI") {
      const { count, timestamps } = message;
      document.getElementById("count").textContent = count;
      const timestampListDiv = document.getElementById("timestamps-list");
      timestampListDiv.innerHTML = timestamps.map((ts, index) => {
        const date = new Date(ts);
        return `<div>${index + 1}. ${date.toLocaleString()}</div>`;
      }).join('');
    }
  });

  // 設定を読み込む
  chrome.storage.local.get(['showBadge', 'targetModel', 'maxTimestamps', 'timeToCount'], (result) => {
    document.getElementById('show-badge').checked = result.showBadge ?? true;
    document.getElementById('target-model').value = result.targetModel ?? 'gpt-4';
    document.getElementById('max-timestamps').value = result.maxTimestamps ?? 50; // 保存メッセージ数 デフォルトは50回
    document.getElementById('time-to-count').value = (result.timeToCount ?? 3 * 60 * 60 * 1000) / 1000; // タイムスタンプ保持時間 デフォルトは3時間
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
    const maxTimestamps = parseInt(document.getElementById('max-timestamps').value);
    const timeToCount = parseInt(document.getElementById('time-to-count').value) * 1000;
  
    chrome.storage.local.set({ showBadge, targetModel, maxTimestamps, timeToCount });
  });
});
```