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
