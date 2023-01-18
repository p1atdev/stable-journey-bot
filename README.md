# Stable Journey Bot

Discord bot client for AUTOMATIC1111's [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui).


![image](https://user-images.githubusercontent.com/60182057/213064092-6a1e057c-3cfd-48f6-8c59-9c14359b00b2.png)


# 使い方

## Web UIの準備

必要に合わせて起動フラグに以下を追加します

- `--api` **必須**。API機能を有効にします
- `--listen` 欲しい場合のみ。`0.0.0.0` でホストされるので、ドメインと紐づけている人とかはこれが必要。ただし、これを有効にすると拡張機能を入れることが出来ないので、頻繁に拡張機能を弄る人は非推奨。
- `--nowebui` 推奨。Gradio の Web UI 機能を無効にします。Bot から生成するだけなら Web UI は不要なので、これを有効にすると起動が早くなったりする気がします。多分。
- `--share` Botを自分のPC以外で動かしたいときには必須。ただし `--nowebui` とは共存できません。
- `--ngrok` Gradio の share を利用しないときの選択肢。詳しい使い方知らないのでわからない。

また、起動時に出る `Running on local URL:  http://0.0.0.0:7860` や `Uvicorn running on http://0.0.0.0:7861` はちゃんと見ておきましょう。特にポート番号。基本的に `localhost:7860` ですが、 `--nowebui` の場合は `7861` になります。

## `./webui-user.bat` の設定例

### ローカルで軽く動かすとき

```bat
@echo off

set PYTHON=
set GIT=
set VENV_DIR=
set COMMANDLINE_ARGS=--xformers --api --nowebui
set ATTN_PRECISION=fp16

call webui.bat
```

`--xformers` などはお好みで指定してください。

### 外部に公開するとき

```bat
@echo off

set PYTHON=
set GIT=
set VENV_DIR=
set COMMANDLINE_ARGS=--xformers --api --share
set ATTN_PRECISION=fp16

call webui.bat
```

## BOT の設定

`config.example.yaml` をコピー&リネームして `config.yaml` を作成します。

例に従って必要な項目を入力します。

```yaml
# Discord
DISCORD_TOKEN: hogehoge
GUILD_ID: 1234567890

# BOT
globalCommands: false
allows:
  - switch
  - refresh
  - imagine

# AUTOMATIC1111's Web UI
host: http://localhost:7860
```

- DISCORD_TOKEN: BOTのトークン
- GUILD_ID: BOTを動かすサーバー
- globalCommands: グローバルでスラッシュコマンドを有効にするかどうか
- allows: 実行を許可するコマンド名
- host: Web UI のアドレス

## 実行

```bash
deno task start
```

で実行します。`Ctrl + C` で停止です。