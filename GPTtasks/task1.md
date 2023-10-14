
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
    "authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJuYXBzcGFuc0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sImh0dHBzOi8vYXBpLm9wZW5haS5jb20vYXV0aCI6eyJ1c2VyX2lkIjoidXNlci11NDVraFRHTjd2alN3STZPd25MUEVRY2sifSwiaXNzIjoiaHR0cHM6Ly9hdXRoMC5vcGVuYWkuY29tLyIsInN1YiI6ImF1dGgwfDYzOGQ2MTJlZDUwZGJlYWY0MWY4M2ZkYSIsImF1ZCI6WyJodHRwczovL2FwaS5vcGVuYWkuY29tL3YxIiwiaHR0cHM6Ly9vcGVuYWkub3BlbmFpLmF1dGgwYXBwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE2OTcxODI3MTgsImV4cCI6MTY5ODA0NjcxOCwiYXpwIjoiVGRKSWNiZTE2V29USHROOTVueXl3aDVFNHlPbzZJdEciLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG1vZGVsLnJlYWQgbW9kZWwucmVxdWVzdCBvcmdhbml6YXRpb24ucmVhZCBvcmdhbml6YXRpb24ud3JpdGUgb2ZmbGluZV9hY2Nlc3MifQ.2uTs8kmwgg1kfanHMlUfL_moYSFc4do76Ev0Lm8DLNKOHS6QwPkXLxR5WMk4VXUIluNDnBGpBFZ0kyDTtHYw8IqpBtFe5FFKEVPRUfBMlcjkHYjlnZKaTxPFCYl1cnx_5cIRuyjrUCgh4HV3c10LHpuSg5RNFGVc1sUvsUyWOp5zev90IE_R5hr00xwHEQsIjv6L5J0NIT6TesGXQX5GFfpXBe87XMN2us-eQPytGg5-us5fHEOP_OLAfMJPoZyLlTr8MeUIoFL3ngpi_Yd0ACfSvv3KS9Z4oAFnZo2UFTGohKCPZuDr6b44M2qKnF4yvyZvcaR-qMSvq1g3GmVqbw",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"118\", \"Brave\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1"
  },
  "referrer": "https://chat.openai.com/c/a6b392e5-2216-4c09-8099-83a7084e69fc",
  "referrerPolicy": "same-origin",
  "body": "{\"server_request_id\":\"81580798aabe1a2e-KIX\",\"model\":\"gpt-4-plugins\",\"preflight_time_ms\":55,\"count_tokens\":448,\"ts_first_token_ms\":3604,\"ts_max_token_time_ms\":726,\"ts_mean_token_without_first_ms\":104.73154362416108,\"ts_median_token_without_first_ms\":59,\"ts_min_token_time_ms\":1,\"ts_p95_token_without_first_ms\":344,\"ts_p99_token_without_first_ms\":654.2400000000001,\"ts_std_dev_token_ms\":126.38903211514942,\"ts_total_request_ms\":50423}",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});
```