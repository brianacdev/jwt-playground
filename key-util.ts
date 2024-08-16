import { createPrivateKey, createPublicKey } from "node:crypto";
import { stat, readFile } from "node:fs/promises";

const defaultPrivKeyPath = "./keys/jwtRS256.key";
const defaultPubKeyPath = "./keys/jwtRS256.key.pub";

export default async function useKeyUtil(privKeyPath = defaultPrivKeyPath, pubKeyPath = defaultPubKeyPath) {
  const [privStats, pubStats] = await Promise.all([stat(privKeyPath), stat(pubKeyPath)]);

  if (!privStats.isFile()) {
    console.error(`Private key ${privKeyPath} not found`);
    throw new Error("Could not find private key file");
  }

  if (!pubStats.isFile()) {
    console.error(`Public key ${pubKeyPath} not found`);
    throw new Error("Could not find public key file");
  }

  async function getPrivateKey() {
    const keyContents = await readFile(privKeyPath, { encoding: "utf8" });
    return createPrivateKey({ key: keyContents, format: "pem", encoding: "utf8" });
  }

  async function getPublicKey() {
    const keyContents = await readFile(pubKeyPath, { encoding: "utf8" });
    return createPublicKey({ key: keyContents, format: "pem", encoding: "utf8" });
  }

  return {
    getPrivateKey,
    getPublicKey,
  };
}
