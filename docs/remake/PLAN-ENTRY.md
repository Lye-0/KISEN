# remakeの実装基準

正本は [研究側の再計画](<C:/Users/kawau/Documents/MY DEVELOPMENT TEMP/脱出ゲーム/5_KISEN/replan/00_READ_FIRST.md>)。

このブランチの写しは [plan/00_READ_FIRST.md](plan/00_READ_FIRST.md)。計画の変更は研究側の正本へ反映し、変更理由とこの写しを更新する。

2026-09-29現在：G1〜G3の代表試作中。鞄、写真の表裏と並替え、保守略図、書類箱、録音機と比較紙、切符加工と受け部の状態を制作中。全編実装ではない。

検査入口は `http://127.0.0.1:5205/?remake=representative`、`?remake=photos`、`?remake=recorder`、`?remake=ticket`、`?remake=reader`。後二つは同じ保存領域で券の個体を検査する。通常URLは初回版で、完成版の切替えはまだ。

規則テストと写実の採否、初見の根拠評価を分ける。G1〜G3は全て未合格。進捗と未解決の問題は研究側 `IMPLEMENTATION_CURRENT.md`。特に橋上カメラの物理位置、車内の複数視点、机までの探索一巡、現物レールと車両・足場は未完成。
