# Stable Journey Bot

Discord bot client for AUTOMATIC1111's [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui).

# Usage

めんどいので日本語で書きます。

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

`--xformers` などはお好みで

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

## 環境変数

`.env` を作成し、 `.env.example` に従って必要なトークンなどを入れます

```
DISCORD_TOKEN=hoge
GUILD_ID=1234
AUTO1111_HOST=http://localhost:7860 #WebUIのアドレス。外部公開の場合は https://hogehoge.gradio.app みたいな感じ。最後の / はつけない
```

`GUILD_ID` は、BOTを使うサーバーのIDを入れます。これは、スラッシュコマンドの反映が速いため、自分のサーバーだけを対象にしていますが、グローバルで使いたい場合は別途でコードの編集が必要です(現状)。

`bot.ts` の

```ts
await Promise.all(
    commands.map((command) => {
        bot.helpers.createGuildApplicationCommand(command, Secret.GUILD_ID)
        // bot.helpers.createGlobalApplicationCommand(command)
    })
)
await bot.helpers.upsertGuildApplicationCommands(Secret.GUILD_ID, commands)
// await bot.helpers.upsertGlobalApplicationCommands(commands)
```

を

```ts
await Promise.all(
    commands.map((command) => {
        // bot.helpers.createGuildApplicationCommand(command, Secret.GUILD_ID)
        bot.helpers.createGlobalApplicationCommand(command)
    })
)
// await bot.helpers.upsertGuildApplicationCommands(Secret.GUILD_ID, commands)
await bot.helpers.upsertGlobalApplicationCommands(commands)
```

の様に変更します。

これで多分スラッシュコマンドがグローバルに反映されると思います。ただし、キャッシュの時間が長いため、一度グローバルで反映されると数時間は変更できなくなるので注意です。

## 実行

Deno が必要です。なければ入れてください。いつかDockerで動くようにするかもしれません。しないかもしれません。

入れたら、

```bash
deno task start
```

で動きます。