import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { CustomClient } from "bot";

function createButtonRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("test")
      .setLabel("Launch the modal!")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🚧"),
  );
}

function createSelectMenuRow(): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("test_selectMenu")
      .setPlaceholder("Select an option")
      .addOptions(
        {
          description: "Here's a description",
          label: "Choose me",
          value: "first_option",
        },
        {
          description: "Here's another description",
          label: "Choose me too",
          value: "second_option",
        },
      ),
  );
}

function createEmbed(interaction: ChatInputCommandInteraction): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("Embed Test")
    .setDescription("Here's a button to answer a sentence.")
    .setColor("DarkAqua")
    .setTimestamp()
    .setFooter({
      iconURL: interaction.user.displayAvatarURL(),
      text: interaction.user.username,
    });
}

export default {
  botPermissions: [
    PermissionFlagsBits.ManageNicknames,
    PermissionFlagsBits.SendMessages,
  ],
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Allows you to test individual components.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts([InteractionContextType.Guild]),
  deferOptions: { flags: MessageFlags.Ephemeral },
  async execute(
    client: CustomClient,
    interaction: ChatInputCommandInteraction,
  ) {
    const buttonRow = createButtonRow();
    const selectMenuRow = createSelectMenuRow();
    const embed = createEmbed(interaction);

    return interaction.editReply({
      components: [buttonRow, selectMenuRow],
      content: "Component testing",
      embeds: [embed],
    });
  },
};
