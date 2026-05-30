import "server-only";

export type AppEnv = "local" | "development" | "production";

export function getAppEnv(): AppEnv {
  const appEnv = process.env.APP_ENV;

  if (
    appEnv === "local" ||
    appEnv === "development" ||
    appEnv === "production"
  ) {
    return appEnv;
  }

  if (appEnv) {
    throw new Error(
      "APP_ENV must be one of 'local', 'development', or 'production'.",
    );
  }

  return "local";
}
