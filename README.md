# remake 実装中

現在は再計画に基づく代表区間の制作・検証中です。全編の完成版ではありません。

- [実装基準と計画](docs/remake/PLAN-ENTRY.md)
- [作品計画](docs/remake/plan/02_GAME_PLAN.md)
- [謎の具体設計](docs/remake/plan/03_PUZZLES.md)
- 開発中の鞄・写真: `http://127.0.0.1:5205/?remake=representative`
- 開発中の録音機: `http://127.0.0.1:5205/?remake=recorder`

G1〜G3はまだ全体合格にしていません。以下は初回版の記録です。通常URLは比較用に初回版を表示します。

---
# きさらぎ駅 ― 帰線 ―

写実の景色を読み解き、帰り道をつくる一人用脱出ゲーム。きさらぎ駅を舞台に、12エリアを巡り、観察・短い機構・複数の資料をつなぐ推理で帰路を組み立てます。

全編を実装済みです。初見の所要時間と、人間のブラインドプレイによる難易度評価は未測定です。企画時の6〜8時間という目標を、実測値として表示していません。

## 開発

Node・pnpmは `mise.toml` に固定しています。

```powershell
mise trust
mise install
mise run install
mise run dev
```

http://127.0.0.1:5205/ で起動します。

`mise run build` で型検査と静的ビルド、`mise run test` で状態・物理機構のテストを実行します。`mise exec -- pnpm preview` で本番ビルドを http://127.0.0.1:4205/ に表示します。

`pnpm check:assets` は採用素材と参照・寸法・透過形式を検査します。ブラウザ検証の手順は `scripts/qa-journey.mjs`、検証結果は `docs/qa/FINAL-VERIFICATION.md` にあります。

開発時だけ `?inspect=P30` や `?inspect=P34` で代表機構を検査できます。この検査用状態は通常の保存を上書きしません。本番ビルドでは無効です。

## 制作基準

- 調査・企画の正本：`C:/Users/kawau/Documents/MY DEVELOPMENT TEMP/脱出ゲーム/5_KISEN/09_KISEN_PLAN.md` および10〜13。
- 実装の具体化と変更理由：`docs/design/IMPLEMENTATION.md`。
- 実際に行った検査と未完事項：`docs/qa/`。
- 採用画像：`public/assets/`。生成・編集の対応：`docs/assets/manifest.json`。

ユーザーの保存はブラウザ内のみ。設定からJSONを書き出し・読み込みできます。外部サーバーやアカウントは使いません。

## 操作

物を押して調べ、矢印で移動します。「調べる場所」は任意で表示できます。写真や札は選んで並べ替え、観察した配置を記録できます。手掛かりは段階的に開き、閉じられます。狭い画面では切符の作業面と記録紙を横に動かせます。環境音は設定で切り替えられ、音を聞かなくても必要な情報は画面から得られます。

## 素材

`public/assets/` は採用した70点のみです。`scenes/` は全景と進行差分、`closeups/` は接写、`items/` は道具、`documents/` は写真資料、`parts/` は正確な形を描くための材質、`ending/` は終幕の場面です。固定物と可動部を分け、現在の状態から全景・接写を描画します。画像の候補や検証スクリーンショットは配信物へ含めません。

設計資料と検証手順には解答が含まれます。

