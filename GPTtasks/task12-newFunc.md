下記のコードはchatGPT4に対するメッセージ数をカウントするchrome拡張機能です。
仕様に従いコードを修正してください。

# 機能追加
- meterTest.html及びjsに実装されているゲージ表示機能(<div id="container">)をpopup.htmlに実装してください。
- ゲージの大きさはpopup.htmlの幅で自動調整してください。
- ゲージを表示する場所は'<h1>メッセージ数: <span id="count"></span></h1>'の上です。

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

meteTest.js
```
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
        dtick: 10
      },
      bar: { color: "#FFFFFF" },
      bordercolor: "#00000000"
    }
  }
];

const layout = { width: 600, height: 400 };
Plotly.newPlot('container', data, layout,{displayModeBar: false});

let v = 0

setInterval(()=>{
  data[0].value = v
  Plotly.update('container', {'value':[v]}, layout)
  if(v>50){
    v=0
  }else{
    v++
  }
  // 値が400以上ならばバーの色を黄色に設定
  if (v >= 40) {
    data[0].gauge.bar.color = "#000000";
  } else {
    data[0].gauge.bar.color = "rgb(255,0,0)";
  }
},160)
```

meterTest.html
```
<!DOCTYPE html>
<html>
  <head>
    <title>a</title>
    <script src='https://cdn.plot.ly/plotly-2.26.0.min.js'></script>
  </head>
  <body>
    <div id="container"></div>
    <script src='meterTest.js'></script>
  </body>
</html>
```