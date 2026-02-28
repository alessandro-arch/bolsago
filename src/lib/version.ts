declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: string;

export const APP_VERSION: string = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";
export const BUILD_TIME: string = typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : new Date().toISOString();

export const ENVIRONMENT: "PROD" | "PREVIEW" =
  typeof window !== "undefined" && window.location.hostname === "bolsago.innovago.app"
    ? "PROD"
    : "PREVIEW";

export function logVersion() {
  if (ENVIRONMENT !== "PROD") {
    console.log(`[BolsaGO] v${APP_VERSION} • ${ENVIRONMENT} • Build: ${BUILD_TIME}`);
  }
}
