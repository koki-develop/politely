# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Politely は Electron + React + TypeScript で構築されたデスクトップアプリケーションです。

## Tech Stack

- **Runtime**: Electron 40 (Electron Forge でビルド)
- **Frontend**: React 19 + React Compiler (babel-plugin-react-compiler)
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

- **Main Process** (`src/main.ts`): Electron のメインプロセス。BrowserWindow の作成とアプリライフサイクル管理
- **Preload Script** (`src/preload.ts`): メインプロセスとレンダラー間のブリッジ（現在は空）
- **Renderer Process** (`src/renderer.tsx`): React アプリのエントリーポイント

### Vite 設定

- `vite.main.config.ts` - Main プロセス用
- `vite.preload.config.ts` - Preload スクリプト用
- `vite.renderer.config.ts` - Renderer プロセス用（React Compiler + Tailwind CSS）

### コードスタイル（Biome）

- インデント: スペース
- クォート: ダブルクォート
- インポート自動整理: 有効
