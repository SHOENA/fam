# ふたりと家族の紹介（Cloudflare Pages + D1）

## しくみ
- GitHub の main に push → GitHub Actions が自動でデプロイ（Cloudflareのビルド枠は使わない）
- リポジトリに入るのはコードだけ。名前・写真・お住まい等は Cloudflare D1 にだけ保存（リポジトリには一切入らない）
- 合言葉(EDIT_KEY)と APIトークンは、リポジトリではなく Cloudflare / GitHub の Secrets に置く
- 無料枠: Pages・Functions 10万リクエスト/日、D1 読み取り500万行/日。画面を開いている間だけ10秒ごとに確認する設計で、家族数人なら余裕

## 初回セットアップ（1回だけ）
1. GitHub に新しいリポジトリ（公開でOK）を作り、このフォルダを push
2. ローカルで: npm i -g wrangler && wrangler login
3. wrangler d1 create fam → 出た database_id を wrangler.toml に貼って commit
4. wrangler pages project create shiori --production-branch main
5. wrangler pages secret put EDIT_KEY --project-name shiori   （家族だけの合言葉を入力）
6. Cloudflare ダッシュボード > My Profile > API Tokens で、テンプレート「Edit Cloudflare Workers」を元に
   権限に Account > D1 > Edit と Cloudflare Pages > Edit を含むトークンを作成
7. GitHub リポジトリ > Settings > Secrets and variables > Actions に登録:
   CLOUDFLARE_API_TOKEN（手順6）, CLOUDFLARE_ACCOUNT_ID（ダッシュボード右側に表示）
8. main に push（または Actions タブから Run workflow）→ デプロイ完了

以後は push するだけで更新されます。

## URL
- 閲覧用: https://shiori.pages.dev/
- 編集用: https://shiori.pages.dev/?edit=合言葉（家族だけに共有）
