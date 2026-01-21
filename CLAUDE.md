# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Politely は Electron + React + TypeScript で構築されたデスクトップアプリケーションです。

## Tech Stack

- **Runtime**: Electron 40 (Electron Forge でビルド)
- **Frontend**: React 19 + React Compiler (babel-plugin-react-compiler)
- **Backend**: Hono + @hono/node-server (メインプロセス内で起動)
- **Styling**: Tailwind CSS v4 (Vite plugin)
- **Build Tool**: Vite 6
- **Package Manager**: Bun
- **Linter/Formatter**: Biome

## Commands

```bash
# 開発サーバー起動
bun start

# リント
bun run lint

# フォーマット（自動修正）
bun run format

# パッケージングのみ（インストーラーなし）
bun run package

# 配布用ビルド（インストーラー作成）
bun run make
```

## Architecture

### Electron プロセス構成

- **Main Process** (`src/main.ts`): Electron のメインプロセス。BrowserWindow の作成、アプリライフサイクル管理、Hono サーバーの起動・停止
- **Preload Script** (`src/preload.ts`): メインプロセスとレンダラー間のブリッジ（現在は空）
- **Renderer Process** (`src/renderer.tsx`): React アプリのエントリーポイント
- **API Server** (`src/server/index.ts`): Hono ベースの HTTP サーバー（localhost:3001）。メインプロセス内で起動され、レンダラーから fetch で通信

### ディレクトリ構成

```
src/
├── main.ts              # Electron メインプロセス
├── renderer.tsx         # React エントリーポイント
├── preload.ts           # Preload スクリプト
├── App.tsx              # React ルートコンポーネント
├── index.css            # Tailwind CSS
├── server/              # Hono API サーバー
│   └── index.ts
├── hooks/               # カスタムフック
└── components/          # React コンポーネント
```

### Vite 設定

- `vite.main.config.ts` - Main プロセス用
- `vite.preload.config.ts` - Preload スクリプト用
- `vite.renderer.config.ts` - Renderer プロセス用（React Compiler + Tailwind CSS）

### セキュリティ方針

- API キーなどの機密情報はメインプロセス（Hono サーバー）側で管理し、レンダラーには露出させない
- 外部 API 呼び出しは Hono サーバーを経由して行う

### コードスタイル（Biome）

- インデント: スペース
- クォート: ダブルクォート
- インポート自動整理: 有効
- `useExhaustiveDependencies`: useEffect 内で関数を呼び出す場合、useCallback でメモ化して依存配列に追加すること
