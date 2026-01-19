# 家族アプリプロジェクト

## 開発プロセス

新機能の開発時は、以下の順序で進める：

1. **要件定義** - 機能の目的、ユーザーストーリー、受け入れ条件を明確化
2. **詳細設計** - DB スキーマ、API 設計、コンポーネント構成を決定
3. **実装** - 設計に基づいてコードを作成

### ドキュメント規約

設計ドキュメントは以下のファイルに集約する：

- 要件定義: `docs/requirements.md`
- 詳細設計: `docs/design.md`

### 追加改修時の確認事項

既存機能の改修や機能追加を行う場合は、実装開始前に以下を確認する：

- `docs/requirements.md` に該当機能の要件定義が存在すること
- `docs/design.md` に該当機能の詳細設計が存在すること
- 設計ドキュメントが最新の状態に更新されていること

ドキュメントが不足している場合は、先に作成・更新してから実装に着手する。

## スキル

Next.js アプリの構築時は `./claude-skills/nextjs-family-app-starter/SKILL.md` を参照。

## 技術スタック

- Next.js 16 + TypeScript
- Turso + Drizzle ORM
- Better Auth（Google 認証）
- Tailwind CSS v4 + shadcn/ui