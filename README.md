<p align="center">
<img src="./assets/icon.png" width="128" height="128" alt="Politely Logo"/>
</p>

<h1 align="center">Politely</h1>
<p align="center">
<i>話すだけで、丁寧な文章に。</i>
</p>

<p align='center'>
<a href="https://github.com/koki-develop/politely/releases/latest"><img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/koki-develop/politely?style=flat"></a>
<a href="./LICENSE"><img src="https://img.shields.io/github/license/koki-develop/politely?style=flat" /></a>
<a href="https://github.com/koki-develop/politely/actions/workflows/ci.yml"><img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/koki-develop/politely/ci.yml?branch=main&logo=github&style=flat" /></a>
<img alt="macOS" src="https://img.shields.io/badge/platform-macOS-blue?style=flat" />
</p>

<p align="center">
<img src="./docs/demo.gif">
<p align="center"><i>丁寧さを「<b>最強</b>」に設定し、 "こんにちは" と音声入力した例</i></p>
</p>

## インストール

> [!NOTE]
> Politely を使用するには OpenAI API キーが必要です。事前に [OpenAI Platform](https://platform.openai.com/settings/organization/api-keys) にサインアップし、API キーを取得してください。

```console
$ brew install --cask koki-develop/tap/politely
```

初回起動時にセットアップウィザードが表示されます。画面の指示に従って API キーの設定や権限の許可を行ってください。

## サポートされているモデル

### 文字起こし

- `gpt-4o-transcribe`
- `gpt-4o-mini-transcribe`
- `whisper-1`

### 丁寧語変換

- `gpt-5.2`
- `gpt-5.1`
- `gpt-5`
- `gpt-5-mini`
- `gpt-5-nano`
- `gpt-4.1`
- `gpt-4.1-mini`
- `gpt-4.1-nano`

## ライセンス

[MIT](./LICENSE)
