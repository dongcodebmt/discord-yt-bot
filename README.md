# DiscordYTBot
Discord bot to play music

## Requirements
- Docker
- Docker Compose

## Using
- Create a discord app at [developer portal](https://discord.com/developers/applications?new_application=true)
- Setup permissions
  - Scopes: `bot`, `application.commands`
  - Bot permissions: `Send Messages`, `Embed Links`, `Use Slash Commands`, `Connect`, `Speak`
- Clone this repo  
- Create .env from example.env
  - `TOKEN=<token>`
  - `BOT_LANG=<en|vi>`
```
docker compose up -d --build
```
- Invite the bot to the server, then join a voice channel. Send /deploy to deploy the slash command for bot in the server

## Docs
Send /help to view bot commands

#### Credits to [MisaBot](https://github.com/misa198/misa-bot-discord), Discord.JS, DisTube and more
