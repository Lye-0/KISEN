# きさらぎ駅 ― 帰線 ―

写実の景色を読み解き、帰り道をつくる一人用脱出ゲーム。**現在は制作途中です。** 全編完成や6〜8時間の達成を示す版ではありません。

## 開発

Node・pnpmは `mise.toml` に固定しています。

```powershell
mise trust
mise install
pnpm install --frozen-lockfile
pnpm dev
```

http://127.0.0.1:5205/ で起動します。

`pnpm build` で型検査と静的ビルド、`pnpm test` で状態・物理機構のテストを実行します。

開発時だけ `?inspect=P30` や `?inspect=P34` で代表機構を検査できます。この検査用状態は通常の保存を上書きしません。本番ビルドでは無効です。

## 制作基準

- 調査・企画の正本：`C:/Users/kawau/Documents/MY DEVELOPMENT TEMP/脱出ゲーム/5_KISEN/09_KISEN_PLAN.md` および10〜13。
- 実装の具体化と変更理由：`docs/design/IMPLEMENTATION.md`。
- 実際に行った検査と未完事項：`docs/qa/`。
- 採用画像：`public/assets/`。生成・編集の対応：`docs/assets/manifest.json`。

ユーザーの保存はブラウザ内のみ。設定からJSONを書き出し・読み込みできます。外部サーバーやアカウントは使いません。
