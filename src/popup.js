// ゲージ表示用の初期表示
const layout = {
  width: 260, 
  height: 200,
  margin: { t: 0, b: 0, l: 25, r: 25 },
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
    // document.getElementById("countGauge").setAttribute("value", result.maxTimestamps ?? 50);  // ゲージのレンジ更新
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
    // const maxTimestamps = document.getElementById("countGauge").getAttribute("value");
    // countがあったら数値を更新する。

    if(!maxRange){
      maxRange = data[0].gauge.axis.range;
    }
    if(!count){
      count = data[0].value;
    }

    data[0].value = count;

    const bgColor = calculateGradientColors(count, maxRange);
    data[0].gauge.bar.color = bgColor;
    data[0].gauge.axis.range = [0, maxRange];    

    Plotly.relayout('countGauge', { 'gauge.bar.color': bgColor });
    Plotly.update('countGauge', { 'value': [count] }, (layout));
  };

  // barの色を変更
  function calculateGradientColors(count, maxRange) {
    let r = 14, g = 122, b = 0;

    const ratio = count / maxRange;
  
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
    const bgColor = `rgb(${r}, ${g}, ${b})`;

    return bgColor;
  }


});

