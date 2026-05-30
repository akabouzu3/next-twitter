import "server-only";

import { getAppEnv } from "@/lib/env/app-env";
import { saveLocalImage } from "./save-local-image";
import { saveSupabaseImage } from "./save-supabase-image";

type SaveImageOptions = {
  directory: string;
};

type ImageStorageDriver = "local" | "supabase";

function getImageStorageDriver(): ImageStorageDriver {
  const driver = process.env.IMAGE_STORAGE_DRIVER;

  if (driver === "local" || driver === "supabase") {
    return driver;
  }

  if (driver) {
    throw new Error(
      "IMAGE_STORAGE_DRIVER must be either 'local' or 'supabase'.",
    );
  }

  return getAppEnv() === "production" ? "supabase" : "local";
}

export async function saveImage(
  file: File,
  options: SaveImageOptions,
): Promise<string> {
  const directory = options.directory.replace(/^\/+|\/+$/g, "");

  if (getImageStorageDriver() === "supabase") {
    return saveSupabaseImage(file, {
      directory,
    });
  }

  return saveLocalImage(file, {
    directory: `uploads/${directory}`,
    publicPath: `/uploads/${directory}`,
  });
}
