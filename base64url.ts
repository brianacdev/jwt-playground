import { trimEnd } from "lodash";

const padTemplate = "===";

function padEnd(text: string): string {
  const diff = text.length % 4;
  if (diff === 0) {
    return text;
  }
  return text + padTemplate.slice(diff);
}

export function base64UrlEncodeObject<T extends Record<string, any>>(payload: T): string {
  return trimEnd(Buffer.from(JSON.stringify(payload)).toString("base64url"), "=");
}

export function base64UrlDecodeObject<T extends Record<string, any>>(base64UrlText: string): T {
  return JSON.parse(Buffer.from(padEnd(base64UrlText), "base64url").toString("utf8"));
}
