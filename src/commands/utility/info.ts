import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionContextType,
  SlashCommandBuilder,
  Team,
  User,
} from "discord.js";
import { CustomClient } from "bot";

async function getOwnersList(
  interaction: ChatInputCommandInteraction,
): Promise<string> {
  let owners = "Aucun";
  await interaction.client.application.fetch().then((bot) => {
    if (typeof (bot.owner as User)?.username !== "undefined") {
      owners = `▸ [${(bot.owner as User).username}](https://discord.com/users/${(bot.owner as User).id})`;
    } else if (bot.owner instanceof Team) {
      owners = bot.owner.members
        .map(
          (member) =>
            `▸ [${member.user.username}](https://discord.com/users/${member.user.id})`,
        )
        .join("\n");
    }
  });
  return owners;
}

function createBotInfoEmbed(
  botUser: User,
  interaction: ChatInputCommandInteraction,
  owners: string,
): EmbedBuilder {
  const oneSecondInMs = 1000;
  return new EmbedBuilder()
    .setTitle("Bot information:")
    .setAuthor({
      iconURL: botUser.displayAvatarURL(),
      name: botUser.username,
    })
    .setThumbnail(botUser.displayAvatarURL())
    .setURL("https://apprendre-discord.fr")
    .setDescription(
      "I was created to help as many people as possible on discord.",
    )
    .addFields(
      {
        inline: true,
        name: "Creation date:",
        value: `<t:${Math.floor(botUser.createdTimestamp / oneSecondInMs)}:R>`,
      },
      {
        inline: true,
        name: "Online since",
        value: `<t:${Math.floor(interaction.client.readyTimestamp / oneSecondInMs)}:f>`,
      },
      { inline: true, name: "Owner(s):", value: owners },
      {
        inline: true,
        name: "My developers:",
        value: `▸ [Guscraftin](https://github.com/Guscraftin)`,
      },
    )
    .setColor("DarkAqua")
    .setTimestamp()
    .setFooter({
      iconURL: interaction.user.displayAvatarURL(),
      text: interaction.user.username,
    });
}

export default {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Display bot information.")
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM]),
  deferOptions: {},
  async execute(
    client: CustomClient,
    interaction: ChatInputCommandInteraction,
  ) {
    const botUser = interaction.client.user;
    const owners = await getOwnersList(interaction);
    const embed = createBotInfoEmbed(botUser, interaction, owners);

    return interaction.editReply({ embeds: [embed] });
  },
};
