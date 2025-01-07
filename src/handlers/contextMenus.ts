import { ContextMenuCommandBuilder } from "discord.js";
import CustomContextMenuCommandInteraction from "interfaces/contextMenu";
import process from "node:process";
import path from "path";
import { client } from "../bot";
import { readFilesRecursively } from "./loadFiles";

function isValidContextMenu(
  contextMenu: CustomContextMenuCommandInteraction,
): contextMenu is CustomContextMenuCommandInteraction {
  return (
    contextMenu?.data instanceof ContextMenuCommandBuilder &&
    typeof contextMenu?.execute === "function"
  );
}

async function loadContextMenu(filePath: string): Promise<void> {
  const { default: contextMenu } = await import(filePath);

  if (isValidContextMenu(contextMenu)) {
    client.contextMenus.set(contextMenu.data.name, contextMenu);
  } else {
    throw new Error(
      `[WARNING] The contextMenu at ${filePath} is missing a required "data" or "execute" property.`,
    );
  }
}

export default async function handleContextMenus(): Promise<void> {
  const foldersPath = path.join(process.cwd(), "src/contextMenus");
  try {
    await readFilesRecursively(foldersPath, loadContextMenu);
    console.log(`ContextMenus loaded successfully.`);
  } catch (error) {
    console.error("Failed to load contextMenus: ", error);
  }
}
