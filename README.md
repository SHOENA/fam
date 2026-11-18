# ふたりと家族の紹介（Vite + Svelte / Cloudflare Pages + D1）

## 構成
- src/ …… 画面（Svelte）。components/ に部品ごとのファイル
- shared/ …… 家系図の構成・都道府県リスト（画面とサーバーで共通）
- functions/api/ …… サーバー側（ログイン・データの読み書き）
- server/lib/ …… 認証と入力検証、server/auth.test.js …… テスト
- static/_headers …… セキュリティ設定
- schema.sql …… D1のテーブル定義（デプロイ時に自動で作成）

## 認証のしくみ
- 画面もデータも、合言葉でログインしないと見られません（データのAPIは全て要ログイン）。
- 合言葉は2種類：VIEW_PASS（見るだけ）と EDIT_PASS（編集もできる）。
- ログイン後は、署名つきのCookie（HttpOnly・Secure・SameSite=Strict・30日）で保持。
- 同じ接続元から15分に5回、全体で60回まちがえると、15分ロック。
- SESSION_SECRET を変更すると、全員がログアウトされます。

## Cloudflare に登録するシークレット（Pages > fam > 設定 > 変数とシークレット > 種類: シークレット）
| 名前 | 内容 |
|---|---|
| SESSION_SECRET | 32文字以上のランダムな文字列（下記の方法で作る） |
| EDIT_PASS | 編集用の合言葉（12文字以上を推奨） |
| VIEW_PASS | 閲覧用の合言葉（12文字以上を推奨） |

SESSION_SECRET の作り方：ブラウザの開発者ツール(F12)のコンソールで
`crypto.randomUUID()+crypto.randomUUID()` を実行し、出た文字列を使う。
古い EDIT_KEY は不要になるので削除してよい。シークレットは、次のデプロイから有効になる。

## GitHub Actions の Secrets（変更なし）
CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID

## 更新のしかた
main に push すると、テスト → ビルド → D1のテーブル確認 → デプロイが自動で動く。
