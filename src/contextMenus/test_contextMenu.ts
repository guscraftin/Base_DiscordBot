import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  ContextMenuCommandType,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import { CustomClient } from "bot";

export default {
  cooldown: 10,
  data: new ContextMenuCommandBuilder()
    .setName("test user")
    .setType(ApplicationCommandType.User as ContextMenuCommandType)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  deferOptions: { flags: MessageFlags.Ephemeral },
  async execute(
    client: CustomClient,
    interaction: ContextMenuCommandInteraction,
  ) {
    return interaction.editReply({
      content: "Here's a test contextual menu that works properly!",
    });
  },
};
