# Stable Journey Bot

Discord bot client for AUTOMATIC1111's [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui).

# Usage

めんどいので日本語で書きます。

## 環境変数

`.env` を作成し、 `.env.example` に従って必要なトークンなどを入れます

```
DISCORD_TOKEN=hoge
GUILD_ID=1234
AUTO1111_HOST=http://localhost:7860
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