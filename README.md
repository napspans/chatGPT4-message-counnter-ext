# chatGPT4-message-counnter-ext
openaiのweb版chatGPT4のメッセージ数をカウントするchrome拡張機能

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