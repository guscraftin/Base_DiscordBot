import { CustomClient } from "bot";
import { MessageFlags, ModalSubmitInteraction } from "discord.js";

export = {
  data: {
    name: "test_modal",
  },
  deferOptions: { flags: MessageFlags.Ephemeral },
  async execute(client: CustomClient, interaction: ModalSubmitInteraction) {
    const newTest = interaction.fields?.getTextInputValue("newTest");

    return interaction.editReply({
      content: `Button and modal are conclusive: \`${newTest}\``,
    });
  },
};
