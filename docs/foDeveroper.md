

# 機能
- [x] メッセージカウント
- [x] カウントバッジ表示
- [x] タイムスタンプリスト表示
- [x] カウント任意入力
- [ ] インターバル算出
- [ ] チャットページに埋め込み
- [ ] 多言語対応
- [ ] 設定画面(i18n)
  - [x] カウンタ上限(デフォルト50メッセージ)
  - [x] 削除時間(デフォルト3時間)
  - [x] モデルの変更
  - [x] バッチの表示非・表示
  - [x] カウンターリセット
  - [ ] グラデーションのカラー設定
  - [ ] 言語変更
- [ ] ドネーションページ



# 監視対象リクエスト
```
fetch("https://chat.openai.com/backend-api/conversation", {
  "headers": {
    "accept": "text/event-stream",
    "accept-language": "ja-JP",
    "authorization": "Bearer ***************",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"118\", \"Brave\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1"
  },
  "referrer": "https://chat.openai.com/c/********-****-****-****-************",
  "referrerPolicy": "same-origin",
  "body": "{\"action\":\"next\",\"messages\":[{\"id\":\"********-****-****-****-************\",\"author\":{\"role\":\"user\"},\"content\":{\"content_type\":\"text\",\"parts\":[\"test\\n\"]},\"metadata\":{}}],\"conversation_id\":\"********-****-****-****-************\",\"parent_message_id\":\"********-****-****-****-************\",\"model\":\"gpt-4\",\"timezone_offset_min\":-540,\"suggestions\":[],\"history_and_training_disabled\":false,\"arkose_token\":\"********\",\"force_paragen\":false}",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});
```

# commit message rules
書き方例``「add:△△を追加」``  
変更を加えて機能を日本語で表記
```
editing: 修正中
add:「～追加」 新しい機能追加
fix:「～修正」 バグの修正
refactor: 「～改善」仕様に影響がないコード改善(リファクタ)
perf:「～向上」 パフォーマンス向上関連
style: コメント等スタイルの修正編集
chore: ビルド、補助ツール、ライブラリ関連
docs: read.me、json、アカウントデータ等ドキュメント修正※
test:「～テスト」 テスト関連
```
※read.me、アカウントデータ等の仕様に影響がないドキュメントはdocumentのブランチにてコミット、マージ
