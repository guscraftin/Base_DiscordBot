import fs from "fs/promises";
import path from "path";

export async function readFilesRecursively(
  directoryPath: string,
  // eslint-disable-next-line no-unused-vars
  fileCallback: (filePath: string) => Promise<void>,
): Promise<void> {
  try {
    const files = await fs.readdir(directoryPath, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(directoryPath, file.name);
      if (file.isDirectory()) {
        await readFilesRecursively(filePath, fileCallback);
      } else if (file.name.endsWith(".ts") || file.name.endsWith(".js")) {
        await fileCallback(filePath);
      }
    }
  } catch (error) {
    console.error(`Error reading files in directory ${directoryPath}:`, error);
  }
}
