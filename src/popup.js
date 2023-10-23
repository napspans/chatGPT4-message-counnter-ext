// ゲージ表示用の初期表示
const layout = {
  width: 260, 
  height: 200,
  margin: { t: 25, b: 25, l: 25, r: 25 },
  paper_bgcolor: "#00000000",
  font: { color: "white"}
}; 

const data = [
  {
    domain: { x: [0, 1], y: [0, 1] },
    value: 0,
    title: { text: "" },
    type: "indicator",
    mode: "gauge+number",
    gauge: {
      axis: {
        visible: true,
        range: [0, 50],
        dtick: 10,
        color: ''
      },
      bar: { color: "#FFFFFF" },
      bordercolor: "#545454"
    }
  }
];

Plotly.newPlot('countGauge', data, layout, { displayModeBar: false });


document.addEventListener("DOMContentLoaded", () => {

  // タイムスタンプのリストを表示
  chrome.storage.local.get(['timestamps', 'maxTimestamps'], (result) => {
    const timestamps = result.timestamps || [];
    const maxRange = result.maxTimestamps || 50;
    const count = timestamps.length;
    updateGauge(count, maxRange);
    // document.getElementById("count").textContent = count;

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
      updateGauge(count);
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
    document.getElementById('countGauge').value = result.maxTimestamps ?? 50; // 保存メッセージ数 デフォルトは50回
    document.getElementById('time-to-count').value = (result.timeToCount ?? 3 * 60 * 60 * 1000) / 60 / 1000; // タイムスタンプ保持時間 デフォルトは3時間(180分)
    document.getElementById("countGauge").setAttribute("value", result.maxTimestamps ?? 50);  // ゲージのレンジ更新
    // // ゲージを描画
    // updateGauge(null, maxRange);

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

  // 設定変更保存
  document.getElementById('settings-form').addEventListener('change', () => {
    const showBadge = document.getElementById('show-badge').checked;
    const targetModel = document.getElementById('target-model').value;
    const maxTimestamps = parseInt(document.getElementById('max-timestamps').value);
    const timeToCount = parseInt(document.getElementById('time-to-count').value) * 60 * 1000;
    //ゲージ更新
    updateGauge(null,maxTimestamps);

    chrome.storage.local.set({ showBadge, targetModel, maxTimestamps, timeToCount });
  });






  //ゲージをアップデートする関数 countはオプション
  const updateGauge = (count, maxRange) => {
    const maxTimestamps = document.getElementById("countGauge").getAttribute("value");
    // countがあったら数値を更新する。
    if(!count){
      count = data[0].value;
    }
    if(!maxRange){
      maxRange = data[0].gauge.axis.range;
    }
    const bgColor = calculateGradientColors(count, maxTimestamps);
    data[0].gauge.bar.color = bgColor;
    data[0].value = count;

    data[0].gauge.axis.range = [0, maxRange];

    Plotly.update('countGauge', { 'value': [count] }, layout);
  };

  // グラデーション風のバッジ背景色とテキスト色を計算する関数
  function calculateGradientColors(count, maxTimestamps) {
    let r = 127, g = 255, b = 0;

    if (count <= maxTimestamps * 0.5) {
      // 単色: 緑 (R: 127, G: 255, B: 0)
      r = 127;
      g = 255;
      b = 0;
    } else if (count <= maxTimestamps * 0.7) {
      // 緑からオレンジへのグラデーション (R: 127-255, G: 255-110, B: 0)
      r = Math.floor(127 + (255 - 127) * ((count - 30) / (40 - 30)));
      g = Math.floor(255 - (255 - 110) * ((count - 30) / (40 - 30)));
      b = 0;
    } else if (count <= maxTimestamps * 0.8) {
      // オレンジから赤へのグラデーション (R: 255, G: 110-50, B: 0)
      r = 255;
      g = Math.floor(110 - (110 - 50) * ((count - 40) / (45 - 40)));
      b = 0;
    } else if (count <= maxTimestamps * 0.9) {
      // 単色: 赤 (R: 255, G: 50, B: 0)
      r = 255;
      g = 50;
      b = 0;
    } else {
      // countがconfig.maxTimestamps * 0.9より大きい場合の処理
      r = 255;
      g = 50;
      b = 0;
    }
    
    // RGBA形式に変換
    const bgColor = [r, g, b, 255];

    return bgColor;
  }


});

