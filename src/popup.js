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
