import CustomButtonInteraction from "interfaces/button";
import process from "node:process";
import path from "path";
import { client } from "../bot";
import { readFilesRecursively } from "./loadFiles";

function isValidButton(
  button: CustomButtonInteraction,
): button is CustomButtonInteraction {
  return (
    typeof button?.data?.name === "string" &&
    typeof button?.execute === "function"
  );
}

async function loadButton(filePath: string): Promise<void> {
  const { default: button } = await import(filePath);

  if (isValidButton(button)) {
    client.buttons.set(button.data.name, button);
  } else {
    throw new Error(
      `[WARNING] The button at ${filePath} is missing a required "data" or "execute" property.`,
    );
  }
}

export default async function handleButtons(): Promise<void> {
  const foldersPath = path.join(process.cwd(), "src/buttons");
  try {
    await readFilesRecursively(foldersPath, loadButton);
    console.log(`Buttons loaded successfully.`);
  } catch (error) {
    console.error("Failed to load buttons: ", error);
  }
}
