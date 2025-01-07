import { CustomClient } from "bot";
import { ClientEvents } from "discord.js";
import process from "node:process";
import path from "path";
import { readFilesRecursively } from "./loadFiles";

async function loadEvent(
  client: CustomClient,
  filePath: string,
): Promise<void> {
  const { default: event } = await import(filePath);

  if (!event?.name || typeof event?.execute !== "function") {
    throw new Error(
      `The event in ${filePath} is missing a name or execute function.`,
    );
  }

  if (event.once) {
    client.once(event.name, (...args: ClientEvents[]) =>
      event.execute(...args),
    );
  } else {
    client.on(event.name, (...args: ClientEvents[]) => event.execute(...args));
  }
}

export default async function handleEvents(
  client: CustomClient,
): Promise<void> {
  const foldersPath = path.join(process.cwd(), "src/events");
  try {
    await readFilesRecursively(foldersPath, (filePath) =>
      loadEvent(client, filePath),
    );
    console.log(`Events loaded successfully.`);
  } catch (error) {
    console.error("Failed to load events: ", error);
  }
}
