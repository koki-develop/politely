# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Politely は Electron + React + TypeScript で構築された macOS 向けトレイアプリケーションです。グローバルホットキーで音声入力を開始し、文字起こしされたテキストをカーソル位置に自動入力します。

## Tech Stack

- **Runtime**: Electron 40 (Electron Forge でビルド)
- **Frontend**: React 19 + React Compiler (babel-plugin-react-compiler)
- **Backend**: Hono + @hono/node-server (メインプロセス内で起動)
- **Styling**: Tailwind CSS v4 (Vite plugin)
- **Build Tool**: Vite 6
- **Package Manager**: Bun
- **Linter/Formatter**: Biome
- **Speech-to-Text**: OpenAI Whisper API

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

### アプリ構成

トレイアプリとして動作し、メインウィンドウは持たない。

- **Tray Icon**: メニューバーにアイコンを表示、右クリックで終了メニュー
- **Floating Window**: 録音中に表示されるオーバーレイウィンドウ（focusable: false）
  - `resizeFloatingWindow()` で状態に応じた動的サイズ変更が可能
  - 全画面アプリの上に表示するため `setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })` と `setAlwaysOnTop(true, "screen-saver")` を設定
  - `type: "panel"` + `showInactive()` で元のアプリのフォーカスを維持（Spotlight のような動作）
- **Global Shortcut**: `Cmd+Shift+Space` で録音開始/停止

### Electron プロセス構成

- **Main Process** (`src/main.ts`): トレイアイコン、グローバルショートカット、IPC ハンドラ、Hono サーバーの起動
  - `AppState` 状態マシン（`idle | recording | transcribing | error`）でアプリ状態を管理
- **Preload Script** (`src/preload.ts`): contextBridge による IPC ブリッジ
- **Overlay Renderer** (`src/overlay.tsx`): フローティングウィンドウの React エントリーポイント
- **API Server** (`src/server/index.ts`): Hono ベースの HTTP サーバー（localhost:3001）

### ディレクトリ構成

```
src/
├── main.ts              # Electron メインプロセス（トレイアプリ）
├── overlay.tsx          # オーバーレイウィンドウ React エントリーポイント
├── preload.ts           # IPC ブリッジ（contextBridge）
├── index.css            # Tailwind CSS
├── floatingWindow.ts    # フローティングウィンドウ管理
├── globalShortcut.ts    # グローバルショートカット管理
├── pasteService.ts      # クリップボード + ペースト処理
├── server/              # Hono API サーバー
│   └── index.ts
├── hooks/               # カスタムフック
│   └── useAudioRecorder.ts
├── components/          # React コンポーネント
│   └── RecordingOverlay.tsx
└── types/               # 型定義
    └── electron.d.ts
```

### Vite 設定

- `vite.main.config.ts` - Main プロセス用
- `vite.preload.config.ts` - Preload スクリプト用
- `vite.overlay.config.ts` - Overlay Renderer 用（React Compiler + Tailwind CSS）

### データフロー

1. `Cmd+Shift+Space` → Main Process がアクティブアプリを記録
2. フローティングウィンドウ表示 → 録音開始
3. 再度 `Cmd+Shift+Space` → 録音停止
4. 音声を Hono サーバー経由で Whisper API に送信
5. 文字起こし結果をクリップボードに書き込み
6. AppleScript で元のアプリをアクティブにして `Cmd+V` をシミュレート

### セキュリティ方針

- API キーなどの機密情報はメインプロセス（Hono サーバー）側で管理し、レンダラーには露出させない
- 外部 API 呼び出しは Hono サーバーを経由して行う
- localhost HTTP サーバーはトークン認証で保護（悪意のあるローカルプロセスからの API 濫用を防止）
  - アプリ起動時にランダムトークンを生成（`generateAuthToken()`）
  - IPC でレンダラーにトークンを送信（`auth-token` イベント）
  - HTTP リクエストは `X-Auth-Token` ヘッダーで認証

### macOS 固有の要件

- **アクセシビリティ権限**: AppleScript でキー入力をシミュレートするために必要
- **マイク権限**: 音声録音に必要
- Dock アイコンは `app.dock.hide()` で非表示にしている

### コードスタイル（Biome）

- インデント: スペース
- クォート: ダブルクォート
- インポート自動整理: 有効
- `useExhaustiveDependencies`: useEffect 内で関数を呼び出す場合、useCallback でメモ化して依存配列に追加すること
