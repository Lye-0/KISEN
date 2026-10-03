# きさらぎ駅 ― 帰線 ―

雨の駅で現物を調べ、離れた場所に残る記録をつなぎ、帰るための列車を迎える一人用脱出ゲーム。remakeブランチの新版は、開始から白沢への降車まで操作できます。

[通常入口](http://127.0.0.1:5205/)から開始します。写真内の物を押して調べ、矢印で周囲を見ます。持ち物は選んで対象へ使い、同じ持ち物をもう一度押すと手元で調べられます。「調べる場所」と観察の記録は任意です。音を鳴らさずに必要な情報を画面から読むこともできます。

PC1365×960とタッチ390×844の新規セーブで、開始から終幕まで作者操作・保存再読込を確認しました。136テスト、production build、素材監査が通過。初見の独立評価と、目標6〜8時間の所要時間の実測は未実施です。

- [実装基準と現在の範囲](docs/remake/PLAN-ENTRY.md)
- [作者の全編通し操作](docs/remake/FULL-PLAY-REVIEW.md)
- [観測写真と連続写真](docs/remake/GLOBAL-PHOTOS-REVIEW.md)
- [作品計画](docs/remake/plan/02_GAME_PLAN.md)
- [謎の具体設計](docs/remake/plan/03_PUZZLES.md)

## 開発

Node24.19.0とpnpm11.19.0をmise.tomlに固定しています。

```powershell
mise trust
mise install
mise run install
mise run dev
```

`mise run test`で状態と物理機構の検査、`mise run build`で型検査と静的ビルドを行います。`pnpm check:assets`は参照、寸法、透過形式、採用一覧外ファイルを検査します。本番プレビューは`mise exec -- pnpm preview`で http://127.0.0.1:4205/ に表示します。

保存はブラウザ内に保持し、設定からJSONを書き出し・読み込みできます。アカウントや外部保存サーバーは使いません。新版はversion2の独立した保存です。初回版は?legacyから参照でき、旧保存を黙って移行しません。

## 素材と検証

新版197素材はpublic/assets/remake/、採用原本と加工方法はdocs/remake/assets.json、生成要求はdocs/remake/prompts/に記録しています。初回版の70素材も比較用に保持します。候補画像や作者検証のスクリーンショットを配信物へ含めません。

?remake=journeys/crossing/stopping等は作者向けの隔離した準備状態です。通常入口からの進行確認とは区別しています。初回版の検証記録はdocs/qa/、新版はdocs/remake/の各レビューを参照してください。設計と検証の資料には解答が含まれます。

## GitHub Pages

`main` へのプッシュで `.github/workflows/pages.yml` が起動します。Node.jsとpnpmはプロジェクトの指定版を使用し、ロックファイル固定のインストール、テスト、素材監査、ビルドが成功した場合だけ `dist/` を公開します。作業ブランチへのプッシュでは公開しません。

公開先: https://lye-0.github.io/KISEN/

GitHub側の Settings → Pages → Build and deployment → Source は **GitHub Actions** を使用します。公開URLのサブディレクトリはconfigure-pagesの出力から取得するため、カスタムドメインのルート公開にも対応します。個別のデプロイ用トークンは不要です。

ゲーム中の画像・音声URLは `./assets/` でページのディレクトリから解決します。ルート絶対URLの `/assets/` をTS/TSXへ追加するとプロジェクトPagesで壊れるため使用しません。CSSのpublic素材URLとHTMLの入口・アイコンはViteが `BASE_PATH` に合わせて変換します。画面遷移はクエリーとアプリ内状態を使用するため、SPA用の404リダイレクトは不要です。

ローカルで公開用のビルドを確認する場合（PowerShell）:

```powershell
$env:BASE_PATH = '/KISEN/'
pnpm build
pnpm preview --base /KISEN/
```

プレビューの入口は http://127.0.0.1:4205/KISEN/ です。既定の相対パスビルドへ戻す場合は `Remove-Item Env:BASE_PATH` を実行します。

公式資料: [ViteのGitHub Pages公開](https://vite.dev/guide/static-deploy.html#github-pages)、[GitHub Pagesのカスタムワークフロー](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
