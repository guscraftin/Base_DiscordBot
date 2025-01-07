import { SlashCommandBuilder } from "discord.js";
import CustomSlashCommandInteraction from "interfaces/command";
import process from "node:process";
import path from "path";
import { client } from "../bot";
import { readFilesRecursively } from "./loadFiles";

function isValidCommand(
  command: CustomSlashCommandInteraction,
): command is CustomSlashCommandInteraction {
  return (
    command?.data instanceof SlashCommandBuilder &&
    typeof command?.execute === "function"
  );
}

async function loadCommand(filePath: string): Promise<void> {
  const { default: command } = await import(filePath);

  if (isValidCommand(command)) {
    client.commands.set(command.data.name, command);
  } else {
    throw new Error(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
    );
  }
}

export default async function handleCommands(): Promise<void> {
  const foldersPath = path.join(process.cwd(), "src/commands");
  try {
    await readFilesRecursively(foldersPath, loadCommand);
    console.log(`Commands loaded successfully.`);
  } catch (error) {
    console.error("Failed to load commands: ", error);
  }
}
