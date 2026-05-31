import {
  ApplicationCommandType,
  AutocompleteInteraction,
  BaseInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Collection,
  ContextMenuCommandInteraction,
  Events,
  Interaction,
  InteractionDeferReplyOptions,
  InteractionType,
  MessageFlags,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
} from "discord.js";
import CustomBaseInteraction from "interfaces/baseInteraction";
import CustomButtonInteraction from "interfaces/button";
import CustomContextMenuCommandInteraction from "interfaces/contextMenu";
import CustomModalInteraction from "interfaces/modal";
import CustomSlashCommandInteraction from "interfaces/command";
import CustomStringSelectMenuInteraction from "interfaces/selectMenu";
import { client } from "../bot";

/**
 * Checks if the bot has the necessary permissions to execute an interaction.
 * @param interaction - The interaction to check permissions for
 * @param botInteraction - The bot interaction to check permissions for
 * @returns A string with the missing permissions or an empty string if the bot has the necessary permissions
 */
function checkPermissions(
  interaction: BaseInteraction,
  botInteraction: CustomBaseInteraction,
): string {
  if (!botInteraction.botPermissions) {
    return "";
  }
  if (!interaction.appPermissions) {
    return "The bot lacks permissions. Please contact an administrator of this server.";
  }

  const missingPermissions = interaction.appPermissions.missing(
    botInteraction.botPermissions,
  );
  if (missingPermissions.length) {
    return `Here are the permissions the bot needs to correctly execute your interaction: \`${missingPermissions.join("`, `")}\``;
  }

  return "";
}

/**
 * Handles defer options for interactions EXCEPT for commands / contextMenus.
 * @param interaction - The interaction to handle defer options for
 * @param deferOptions - Optional defer options
 * @returns void
 */
async function handleDeferOptions(
  interaction: Interaction,
  deferOptions?: InteractionDeferReplyOptions,
) {
  if (interaction instanceof AutocompleteInteraction) return;

  if (deferOptions) {
    await interaction.deferReply(deferOptions);
  }
}

function isContextMenuCommandInteraction(
  interaction: unknown,
): interaction is ContextMenuCommandInteraction {
  return interaction instanceof ContextMenuCommandInteraction;
}

function isSlashCommandInteraction(
  interaction: unknown,
): interaction is ChatInputCommandInteraction {
  return interaction instanceof ChatInputCommandInteraction;
}

/**
 * Handles commands and contextMenus interactions.
 */
async function handleCommandInteraction(
  interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction,
): Promise<void> {
  const command =
    client.commands.get(interaction.commandName) ||
    client.contextMenus.get(interaction.commandName);

  try {
    if (!command) {
      throw new Error(
        `No command matching ${interaction.commandName} was found.`,
      );
    }

    // Check permissions
    const returnPermission = checkPermissions(interaction, command);
    if (returnPermission) {
      await interaction.reply({
        content: returnPermission,
        flags: MessageFlags.Ephemeral 
      });
      return;
    }

    // Check cooldowns
    const cooldowns = client.cooldowns.get("commands") as Collection<
      string,
      Collection<string, number>
    >;

    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name) as Collection<
      string,
      number
    >;
    const defaultCooldownDuration = 0;
    const cooldownAmount =
      (command.cooldown ?? defaultCooldownDuration) * 1_000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime =
        (timestamps.get(interaction.user.id) ?? 0) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1_000);
        await interaction.reply({
          content: `Please wait, you are currently on cooldown for the command named \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
          flags: MessageFlags.Ephemeral 
        });
        return;
      }
    }

    // Check defer options
    if (command.deferOptions) {
      await interaction.deferReply(command.deferOptions);
    }

    // Execute command
    if (isContextMenuCommandInteraction(interaction)) {
      await (command as CustomContextMenuCommandInteraction).execute(
        client,
        interaction,
      );
    } else if (isSlashCommandInteraction(interaction)) {
      await (command as CustomSlashCommandInteraction).execute(
        client,
        interaction,
      );
    } else {
      throw new Error(`This command interaction is not valid: ${interaction}`);
    }

    // Set cooldown
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({
        content: "There was an error while executing this command!",
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral 
      });
    }
  }
}

async function handleContextMenuCommandInteraction(
  interaction: ContextMenuCommandInteraction,
) {
  await handleCommandInteraction(interaction);
}

async function handleSlashCommandInteraction(
  interaction: ChatInputCommandInteraction,
) {
  await handleCommandInteraction(interaction);
}

/**
 * Handles buttons interactions.
 */
async function handleButtonInteraction(
  interaction: ButtonInteraction,
): Promise<void> {
  const button = client.buttons.get(interaction.customId);

  try {
    if (!button) {
      throw new Error(`No button matching ${interaction.customId} was found.`);
    }

    // Check permissions
    const returnPermission = checkPermissions(interaction, button);
    if (returnPermission) {
      await interaction.reply({
        content: returnPermission,
        flags: MessageFlags.Ephemeral 
      });
      return;
    }

    // Check cooldowns
    const cooldowns = client.cooldowns.get("buttons") as Collection<
      string,
      Collection<string, number>
    >;

    if (!cooldowns.has(button.data.name)) {
      cooldowns.set(button.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(button.data.name) as Collection<
      string,
      number
    >;
    const defaultCooldownDuration = 0;
    const cooldownAmount = (button.cooldown ?? defaultCooldownDuration) * 1_000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime =
        (timestamps.get(interaction.user.id) ?? 0) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1_000);
        await interaction.reply({
          content: `Please wait, you are currently on cooldown for the button named \`${button.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
          flags: MessageFlags.Ephemeral 
        });
        return;
      }
    }

    // Check defer options
    await handleDeferOptions(interaction, button.deferOptions);

    // Execute button
    await (button as CustomButtonInteraction).execute(client, interaction);

    // Set cooldown
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this button!",
        flags: MessageFlags.Ephemeral 
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this button!",
        flags: MessageFlags.Ephemeral 
      });
    }
  }
}

/**
 * Handles modals interactions.
 */
async function handleModalInteraction(
  interaction: ModalSubmitInteraction,
): Promise<void> {
  const modal = client.modals.get(interaction.customId);

  try {
    if (!modal) {
      throw new Error(`No modal matching ${interaction.customId} was found.`);
    }

    // Check permissions
    const returnPermission = checkPermissions(interaction, modal);
    if (returnPermission) {
      await interaction.reply({
        content: returnPermission,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Check cooldowns
    const cooldowns = client.cooldowns.get("modals") as Collection<
      string,
      Collection<string, number>
    >;

    if (!cooldowns.has(modal.data.name)) {
      cooldowns.set(modal.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(modal.data.name) as Collection<
      string,
      number
    >;
    const defaultCooldownDuration = 0;
    const cooldownAmount = (modal.cooldown ?? defaultCooldownDuration) * 1_000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime =
        (timestamps.get(interaction.user.id) ?? 0) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1_000);
        await interaction.reply({
          content: `Please wait, you are currently on cooldown for the modal named \`${modal.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    // Check defer options
    await handleDeferOptions(interaction, modal.deferOptions);

    // Execute modal
    await (modal as CustomModalInteraction).execute(client, interaction);

    // Set cooldown
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this modal!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this modal!",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}

/**
 * Handles selectMenus interactions.
 */
async function handleSelectMenuInteraction(
  interaction: StringSelectMenuInteraction,
): Promise<void> {
  const selectMenu = client.selectMenus.get(interaction.customId);

  try {
    if (!selectMenu) {
      throw new Error(
        `No selectMenu matching ${interaction.customId} was found.`,
      );
    }

    // Check permissions
    const returnPermission = checkPermissions(interaction, selectMenu);
    if (returnPermission) {
      await interaction.reply({
        content: returnPermission,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Check cooldowns
    const cooldowns = client.cooldowns.get("selectMenus") as Collection<
      string,
      Collection<string, number>
    >;

    if (!cooldowns.has(selectMenu.data.name)) {
      cooldowns.set(selectMenu.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(selectMenu.data.name) as Collection<
      string,
      number
    >;
    const defaultCooldownDuration = 0;
    const cooldownAmount =
      (selectMenu.cooldown ?? defaultCooldownDuration) * 1_000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime =
        (timestamps.get(interaction.user.id) ?? 0) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1_000);
        await interaction.reply({
          content: `Please wait, you are currently on cooldown for the selectMenu named \`${selectMenu.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
          flags: MessageFlags.Ephemeral 
        });
        return;
      }
    }

    // Check defer options
    await handleDeferOptions(interaction, selectMenu.deferOptions);

    // Execute selectMenu
    await (selectMenu as CustomStringSelectMenuInteraction).execute(
      client,
      interaction,
    );

    // Set cooldown
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this selectMenu!",
        flags: MessageFlags.Ephemeral 
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this selectMenu!",
        flags: MessageFlags.Ephemeral 
      });
    }
  }
}

export default {
  execute: async (interaction: BaseInteraction) => {
    if (interaction.isCommand()) {
      if (interaction.commandType === ApplicationCommandType.ChatInput) {
        await handleSlashCommandInteraction(
          interaction as ChatInputCommandInteraction,
        );
      } else {
        await handleContextMenuCommandInteraction(
          interaction as ContextMenuCommandInteraction,
        );
      }
    } else if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
    } else if (interaction.isModalSubmit()) {
      await handleModalInteraction(interaction);
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenuInteraction(interaction);
    } else {
      console.error(
        `This event of type "${InteractionType[interaction.type]}" is not handled in interactionCreate event. InteractionId: ${interaction}`,
      );
    }
  },
  name: Events.InteractionCreate,
};
