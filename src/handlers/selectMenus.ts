import CustomStringSelectMenuInteraction from "interfaces/selectMenu";
import process from "node:process";
import path from "path";
import { client } from "../bot";
import { readFilesRecursively } from "./loadFiles";

function isValidSelectMenu(
  selectMenu: CustomStringSelectMenuInteraction,
): selectMenu is CustomStringSelectMenuInteraction {
  return (
    typeof selectMenu?.data?.name === "string" &&
    typeof selectMenu?.execute === "function"
  );
}

async function loadSelectMenu(filePath: string): Promise<void> {
  const { default: selectMenu } = await import(filePath);

  if (isValidSelectMenu(selectMenu)) {
    client.selectMenus.set(selectMenu.data.name, selectMenu);
  } else {
    throw new Error(
      `[WARNING] The selectMenu at ${filePath} is missing a required "data" or "execute" property.`,
    );
  }
}

export default async function handleSelectMenus(): Promise<void> {
  const foldersPath = path.join(process.cwd(), "src/selectMenus");
  try {
    await readFilesRecursively(foldersPath, loadSelectMenu);
    console.log(`SelectMenus loaded successfully.`);
  } catch (error) {
    console.error("Failed to load selectMenus: ", error);
  }
}
