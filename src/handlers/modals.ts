import CustomModalInteraction from "interfaces/modal";
import process from "node:process";
import path from "path";
import { client } from "../bot";
import { readFilesRecursively } from "./loadFiles";

function isValidModal(
  modal: CustomModalInteraction,
): modal is CustomModalInteraction {
  return (
    typeof modal?.data?.name === "string" &&
    typeof modal?.execute === "function"
  );
}

async function loadModal(filePath: string): Promise<void> {
  const { default: modal } = await import(filePath);

  if (isValidModal(modal)) {
    client.modals.set(modal.data.name, modal);
  } else {
    throw new Error(
      `[WARNING] The modal at ${filePath} is missing a required "data" or "execute" property.`,
    );
  }
}

export default async function handleModals(): Promise<void> {
  const foldersPath = path.join(process.cwd(), "src/modals");
  try {
    await readFilesRecursively(foldersPath, loadModal);
    console.log(`Modals loaded successfully.`);
  } catch (error) {
    console.error("Failed to load modals: ", error);
  }
}
