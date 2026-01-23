# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Politely は Electron + React + TypeScript で構築された macOS 向けトレイアプリケーションです。グローバルホットキーで音声入力を開始し、文字起こしされたテキストをカーソル位置に自動入力します。

## Tech Stack

- **Runtime**: Electron 40 (Electron Forge でビルド)
- **Frontend**: React 19 + React Compiler (babel-plugin-react-compiler)
- **Transcription**: OpenAI API (Main Process 内で直接呼び出し)
- **Styling**: Tailwind CSS v4 (Vite plugin)
- **Build Tool**: Vite 6
- **Package Manager**: Bun
- **Linter/Formatter**: Biome
- **Speech-to-Text**: OpenAI Whisper API

## Commands

```bash
# 開発サーバー起動
bun start

# 型チェック
bun run typecheck

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
- **Floating Window**: オーバーレイウィンドウ（focusable: false）
  - 画面下部に配置（中央ではない）
  - Idle状態でも常時表示し、録音開始ですぐ使える状態を維持
  - `resizeFloatingWindow()` で状態に応じた動的サイズ変更が可能
  - 全画面アプリの上に表示するため `setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })` と `setAlwaysOnTop(true, "screen-saver")` を設定
  - `type: "panel"` + `showInactive()` で元のアプリのフォーカスを維持（Spotlight のような動作）
  - 透明ウィンドウで CSS が正しく適用されるよう `html, body, #root { height: 100% }` が必須（`index.css`）
- **Global Shortcut**: デフォルト `Cmd+Shift+Space` で録音開始/停止（設定でカスタマイズ可能）

### Electron プロセス構成

- **Main Process** (`src/main.ts`): トレイアイコン、グローバルショートカット、IPC ハンドラ
  - `AppState` 状態マシン（`idle | recording | transcribing | error`）でアプリ状態を管理
- **Preload Script** (`src/preload.ts`): contextBridge による IPC ブリッジ
- **Overlay Renderer** (`src/overlay.tsx`): フローティングウィンドウの React エントリーポイント
- **Transcription Service** (`src/transcription/service.ts`): OpenAI API を使用した文字起こし処理

### ディレクトリ構成

```
src/
├── main.ts              # Electron メインプロセス（トレイアプリ）
├── overlay.tsx          # オーバーレイウィンドウ React エントリーポイント
├── settings.tsx         # 設定画面 React エントリーポイント
├── preload.ts           # IPC ブリッジ（contextBridge）
├── preload.settings.ts  # 設定画面用 IPC ブリッジ
├── index.css            # Tailwind CSS
├── floatingWindow.ts    # フローティングウィンドウ管理
├── settingsWindow.ts    # 設定ウィンドウ管理
├── globalShortcut.ts    # グローバルショートカット管理
├── pasteService.ts      # クリップボード + ペースト処理
├── transcription/       # 文字起こし処理
│   └── service.ts       # OpenAI API を使用した文字起こし + 丁寧語変換
├── ipc/                 # IPC 通信
│   ├── channels.ts      # チャンネル定数
│   └── handlers.ts      # IPC ハンドラ（録音、設定、権限）
├── shortcut/            # ショートカット処理
│   └── handler.ts       # ショートカットハンドラ
├── state/               # 状態管理
│   └── appState.ts      # AppStateManager（状態マシン）
├── errors/              # エラー定義
│   └── codes.ts         # エラーコード、メッセージ、ヘルパー関数
├── constants/           # 定数定義
│   └── ui.ts            # ウィンドウサイズ、タイミング定数
├── utils/               # ユーティリティ関数
│   └── shortcut.ts      # ショートカット表示変換
├── permissions/         # 権限管理
│   ├── service.ts       # macOS 権限チェック・リクエスト・設定を開く
│   └── permissionChecker.ts # 録音開始時の権限チェックフロー
├── settings/            # 設定管理
│   ├── schema.ts        # Zod スキーマ・型定義
│   └── store.ts         # electron-store ラッパー
├── hooks/               # カスタムフック
│   └── useAudioRecorder.ts
├── components/          # React コンポーネント
│   ├── RecordingOverlay.tsx
│   ├── SettingsApp.tsx
│   ├── ModelSelector.tsx
│   ├── ApiKeyInput.tsx
│   ├── ToggleSwitch.tsx
│   └── ShortcutInput.tsx
└── types/               # 型定義
    └── electron.d.ts
```

### Vite 設定

- `vite.main.config.ts` - Main プロセス用
- `vite.preload.config.ts` - Preload スクリプト用
- `vite.overlay.config.ts` - Overlay Renderer 用（React Compiler + Tailwind CSS）
- `vite.settings.config.ts` - Settings Renderer 用

**注意**: `vite.main.config.ts` と `vite.preload.config.ts` は空の設定（`defineConfig({})`）でOK。Electron Forge の Vite プラグインが Node.js 向けの設定を自動で処理する。

### 新しい Renderer ウィンドウの追加方法

1. `{name}.html` を作成（例: `settings.html`）
2. `src/{name}.tsx` を作成（React エントリーポイント）
3. `src/preload.{name}.ts` を作成（IPC ブリッジ）
4. `src/{name}Window.ts` を作成（BrowserWindow 管理）
5. `vite.{name}.config.ts` を作成（`vite.overlay.config.ts` をコピー、`input` パスを変更）
6. `forge.config.ts` の `renderer` 配列と `build` 配列に追加
7. `forge.env.d.ts` に `{NAME}_WINDOW_VITE_DEV_SERVER_URL` と `{NAME}_WINDOW_VITE_NAME` を追加

### 設定の永続化

- **electron-store** を使用（Main Process でのみ動作）
- **zod** でスキーマ定義・バリデーション（`z.enum()` で選択肢を定義、`safeParse()` でバリデーション）
- 設定データは `~/Library/Application Support/politely/settings.json` に保存

### 状態管理

- **Single Source of Truth**: Main Process (`AppStateManager`) が唯一の状態管理元
- **状態同期**: Main Process が状態変更時に `state-changed` IPC で Renderer に通知
- **Renderer**: `onStateChanged` で状態を購読し、ローカル状態を直接更新しない
- **状態遷移検証**: `AppStateManager.transition()` で有効な遷移のみ許可
- **新しい状態遷移の追加**: `src/state/appState.ts` の `VALID_TRANSITIONS` 配列に追加が必要

### データフロー

1. グローバルショートカット（デフォルト `Cmd+Shift+Space`）→ Main Process がアクティブアプリを記録
2. フローティングウィンドウ表示 → 録音開始
3. 再度グローバルショートカット → 録音停止
4. 音声を IPC 経由で Main Process に送信、Whisper API で文字起こし + GPT で丁寧語変換
5. 文字起こし結果をクリップボードに書き込み
6. AppleScript で元のアプリをアクティブにして `Cmd+V` をシミュレート

### IPC 通信パターン

- **invoke/handle パターンを優先**: 応答が必要な IPC 通信は `ipcRenderer.invoke()` + `ipcMain.handle()` を使用
- **send/on パターンは Push 通知のみ**: Main から Renderer への一方向通知（状態変更など）のみ `send/on` を使用
- **型安全性**: `IPC_INVOKE`, `IPC_RENDERER_TO_MAIN`, `IPC_MAIN_TO_RENDERER` の定数を使用し、文字列リテラルを避ける

### セキュリティ方針

- API キーなどの機密情報はメインプロセス側で管理し、レンダラーには露出させない
- 外部 API 呼び出しは IPC 経由で Main Process 内で実行する（`ipcRenderer.invoke` → `ipcMain.handle`）

### macOS 固有の要件

- **アクセシビリティ権限**: AppleScript でキー入力をシミュレートするために必要
- **マイク権限**: 音声録音に必要
- Dock アイコンは `app.dock.hide()` で非表示にしている

### macOS 権限チェック

- **権限チェック API**:
  - アクセシビリティ: `systemPreferences.isTrustedAccessibilityClient(prompt)`
  - マイク: `systemPreferences.getMediaAccessStatus("microphone")` / `askForMediaAccess("microphone")`
- **システム設定を開く**: `shell.openExternal("x-apple.systempreferences:com.apple.preference.security?Privacy_*")`
- **Info.plist**: `forge.config.ts` の `packagerConfig.extendInfo` に `NSMicrophoneUsageDescription` を設定

### コードスタイル（Biome）

- インデント: スペース
- クォート: ダブルクォート
- インポート自動整理: 有効
- `useExhaustiveDependencies`: useEffect 内で関数を呼び出す場合、useCallback でメモ化して依存配列に追加すること

### UIデザイン方針

- **ミニマル**: 状態を表すテキスト（"Ready", "Recording" 等）は不要、アイコンやビジュアルのみで表現
- **コンパクト**: フローティングウィンドウは極力小さく、邪魔にならないサイズに
- **エラーメッセージ**: 簡潔な文調で統一（例: 「〜へのアクセスを許可してください。」）
- **エラーからのアクション導線**: エラー表示には解決への導線（設定を開くボタン等）を提供する

### エラーハンドリング

- **構造化エラー**: `AppError` 型（`{ code: ErrorCode, message: string }`）を使用
- **エラーコード**: `src/errors/codes.ts` の `ERROR_CODES` で定義、文字列検索ではなくコードで判定
- **エラーメッセージ**: `ERROR_MESSAGES` マップで一元管理
- **権限エラー判定**: `isPermissionError(code)`, `getPermissionErrorType(code)` ヘルパー関数を使用

### OpenAI API 使用方針

- **Structured Output を優先**: LLM からの出力を安定させるため、`openai.chat.completions.parse()` と Zod スキーマ（`zodResponseFormat`）を使用する
- **注意**: `openai.beta.chat.completions.parse()` ではなく `openai.chat.completions.parse()` を使用すること
