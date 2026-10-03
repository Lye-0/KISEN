# remakeの実装基準

正本は [研究側の再計画](<C:/Users/kawau/Documents/MY DEVELOPMENT TEMP/脱出ゲーム/5_KISEN/replan/00_READ_FIRST.md>)。このブランチの写しは [plan/00_READ_FIRST.md](plan/00_READ_FIRST.md)。

2026-10-01: 通常入口から白沢への降車まで操作できる新版を実装。PC1365×960とタッチ390×844の新規セーブで、開始・道具の取得と再使用・地下通路・分岐・券の加工と設置・停車・乗車・降車・終幕再読込を作者検査した。136テスト、build、197新版素材と70旧版素材、132.7MiBの素材監査が通過。

通常入口は http://127.0.0.1:5205/ 。現在の保存はversion3で、作り直し版のversion2を読み込み時に移行する。代表検査の?remake=journeys/crossing/stoppingなどは隔離した保存領域と準備状態を使う。新規探索の検証結果は代表入口での成功と区別する。

- [現在の実装と検証の範囲](IMPLEMENTATION_CURRENT.md)
- [新規セーブからの作者通し操作](FULL-PLAY-REVIEW.md)
- [広域観測と連続写真の照合](GLOBAL-PHOTOS-REVIEW.md)
- [空間と現物の契約](plan/04_SPACE_AND_INTERACTION.md)
- [制作・合否判断](plan/05_PRODUCTION.md)

初見の独立解読、6〜8時間の実測、32候補の独立性、素材全状態の最終品質は未実証。G1〜G3を作者の操作成功やテスト数だけで合格へ変更していない。計画変更と理由は研究側の正本とこの写しへ反映する。
