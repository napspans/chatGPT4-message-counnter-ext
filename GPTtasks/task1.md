
open AIのChatGPT-4 web版は現在、3時間あたり50メッセージの上限が設けされています。残りメッセージ数と制限時間を把握するためchrome拡張機能を作成するための質問をします。
https://chat.openai.com/ 上でchatGPT4に送信したメッセージをカウントする拡張機能を作成したいです。
カウントは1メッセージは監視対象リクエストが発生し、"body"の"model"に"gpt-4"が含まれている時にカウントを行います。

詳細に作成手順をおしえてください。

- 過去50メッセージのタイムスタンプをローカルストレージに保存する。
- 51メッセージ以降は古い順に削除する。
- 現在時刻よりタイムスタンプが3時間経過した場合リストから削除する
- 現在リストに入っているタイムスタンプの数をポップアップで表示する。

# 監視対象リクエスト

```
fetch("https://chat.openai.com/backend-api/lat/r", {
  "headers": {
    "accept": "*/*",
    "accept-language": "ja-JP",
    "authorization": "Bearer *********************",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"118\", \"Brave\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1"
  },
  "referrer": "https://chat.openai.com/c/********************",
  "referrerPolicy": "same-origin",
  "body": "{\"server_request_id\":\"*********************\",\"model\":\"gpt-4-plugins\",\"preflight_time_ms\":55,\"count_tokens\":448,\"ts_first_token_ms\":3604,\"ts_max_token_time_ms\":726,\"ts_mean_token_without_first_ms\":104.73154362416108,\"ts_median_token_without_first_ms\":59,\"ts_min_token_time_ms\":1,\"ts_p95_token_without_first_ms\":344,\"ts_p99_token_without_first_ms\":654.2400000000001,\"ts_std_dev_token_ms\":126.38903211514942,\"ts_total_request_ms\":50423}",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});
```