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
  const body = String.fromCharCode.apply(null, new Uint8Array(details.requestBody.raw[0].bytes));
  if (body.includes(`"model":"${config.targetModel}`)) {
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
  let r = 127, g = 255, b = 0;

  const ratio = count / config.maxTimestamps;
  

  if (ratio < 0.5) {
    // 単色: 緑 (r=14 g=122 b=0)
    r = 14;
    g = 122;
    b = 0;
  } else if (ratio >= 0.5 && ratio < 0.7) {
    // 緑からオレンジ r=14 g=122 b=0 から r=196 g=88 b=0
    const gradientRatio = (ratio - 0.5) / 0.2;
    r = 14 + Math.round((196 - 14) * gradientRatio);
    g = 122 + Math.round((88 - 122) * gradientRatio);
    b = 0;
  } else if (ratio >= 0.7 && ratio < 0.9) {
    // オレンジから赤へのグラデーション (r=196 g=88 b=0 から r=226g=45b=0)
    const gradientRatio = (ratio - 0.7) / 0.2;
    r = 196 + Math.round((226 - 196) * gradientRatio);
    g = 88 + Math.round((45 - 88) * gradientRatio);
    b = 0;
  } else if (ratio >= 0.9 && ratio < 1) {
    const gradientRatio = (ratio - 0.9) / 0.1;
    r = 226 + Math.round((0 - 226) * gradientRatio);
    g = 0;
    b = 0;
  } else if (ratio >= 1) {
    r = 0;
    g = 0;
    b = 0;
  }
  // RGBA形式に変換
  const bgColor = [r, g, b, 255];
  // 文字色を自動調整
  const textColor = [255, 255, 255, 255] ;

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
