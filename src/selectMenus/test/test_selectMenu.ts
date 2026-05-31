import {
  MessageFlags,
  PermissionFlagsBits,
  StringSelectMenuInteraction,
} from "discord.js";
import { CustomClient } from "bot";

export default {
  botPermissions: [PermissionFlagsBits.AttachFiles],
  data: {
    name: "test_selectMenu",
  },
  deferOptions: { flags: MessageFlags.Ephemeral },
  async execute(
    client: CustomClient,
    interaction: StringSelectMenuInteraction,
  ) {
    const first = 0;
    switch (interaction.values[first]) {
      case "first_option":
        return interaction.editReply({
          content: "You chose the first option!",
        });
      case "second_option":
        return interaction.editReply({
          content: "You chose the second option!",
        });
      default:
        return interaction.editReply({
          content: "You haven't chosen an option!",
        });
    }
  },
};
