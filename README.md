# Base_DiscordBot

This is a basic structure for a typescript discord bot.

## Bot installation

1. Clone this repository with the command `git clone https://github.com/Guscraftin/Base_DiscordBot.git`.
   _You need to have git installed on your machine. If your machine doesn't recognize the `git` command, install it via this link: <https://git-scm.com/download/>. Once git is installed, open `Git Bash` (if you are on Windows) to execute git commands._

2. Go to the root of the directory you just downloaded (using the command `cd Base_DiscordBot`) and run the command: `npm i`.  
   _You need to have Node.js installed on your machine. If your machine doesn't recognize the npm command, install it via this link: <https://nodejs.org/en/download/>._

3. Rename the `.env.example` file to `.env`.

4. Open the `.env` file and replace the `...` with your own values.

5. To obtain these values, follow these steps:

   1. Go to <https://discord.com/developers/applications> and create a new application by clicking the button at the top right. Enter your bot's name, agree to the terms of service, and then click "Create".
   2. In the "Bot" section, click "Reset Token", then click the "Copy" button to copy the bot token that appears. Replace the `...` with this token in the `TOKEN=` variable in the `.env` file.
   3. In the "OAuth2" section, click "Copy" under the client ID. Replace the `...` with this ID in the `CLIENT_ID=` variable in the `.env` file.
   4. Enable developer mode in your Discord settings by going to user settings, then the "Advanced" section. Right-click the server where you want to invite the bot, then click "Copy ID". Replace the `...` with this ID in the `GUILD_ID=` variable in the `.env` file.

6. To invite the bot to your server, follow these steps:
   1. Go back to <https://discord.com/developers/applications> and select your bot application.
   2. Click on the "OAuth2" section and then on "URL Generator". In the "Scope" field, select "bot". Choose the permissions you want to grant the bot when it joins a Discord server. If you want to give it all permissions, you can grant it administrator permission.
   3. Once you've made your selections, copy the generated URL and paste it into your browser to add the bot to the server where you previously copied the ID.

## Starting the bot

- Run the command `npm start` in the previously cloned folder.
