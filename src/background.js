
// HTTPリクエストを監視
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.method === "POST") {
      const body = decodeURIComponent(String.fromCharCode.apply(null, new Uint8Array(details.requestBody.raw[0].bytes)));
      if (body.includes('"model\":\"gpt-4')) {
        const timestamp = Date.now();
        saveTimestamp(timestamp);
      }
    }
  },
  { urls: ["https://chat.openai.com/backend-api/conversation"] },
  ["requestBody"]
);

// タイムスタンプを保存する関数
function saveTimestamp(timestamp) {
  chrome.storage.local.get(['timestamps'], (result) => {
    let timestamps = result.timestamps || [];
    timestamps.push(timestamp);
    
    // ソートと古いタイムスタンプの削除
    timestamps.sort();
    if (timestamps.length > 50) {
      timestamps = timestamps.slice(-50);
    }
    
    // 3時間以上古いものを削除
    const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
    timestamps = timestamps.filter((ts) => ts > threeHoursAgo);

    // バッジテキストを設定
    chrome.action.setBadgeText({text: timestamps.length.toString()});
    
    if (timestamps.length <= 20) {
      chrome.action.setBadgeBackgroundColor({color: [127, 255, 0, 255]});  // Green
      if (chrome.action.setBadgeTextColor) {  // Chrome 98以降でサポート
        chrome.action.setBadgeTextColor({color: [0, 0, 0, 255]});
      }
    } else if (timestamps.length > 20 && timestamps.length <= 23) {
      chrome.action.setBadgeBackgroundColor({color: [255, 110, 0, 255]});  // Orange
      if (chrome.action.setBadgeTextColor) {  // Chrome 98以降でサポート
        chrome.action.setBadgeTextColor({color: [255, 255, 255, 255]});
      }
    } else {
      chrome.action.setBadgeBackgroundColor({color: [255, 50, 50, 255]});  // Red
      if (chrome.action.setBadgeTextColor) {  // Chrome 98以降でサポート
        chrome.action.setBadgeTextColor({color: [255, 255, 255, 255]});
      }
    }

    // ローカルストレージに保存
    chrome.storage.local.set({timestamps});
  });
}
