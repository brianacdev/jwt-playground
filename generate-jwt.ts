import "dotenv/config";
import { isEqual, pick, camelCase, keysIn, mapKeys } from "lodash";
import useKeyUtil from "./key-util";
import { createSign, createVerify, randomBytes, createSecretKey } from "node:crypto";

type CryEnv = { privateKey: string; publicKey: string; secret: string };

const cryEnvs = mapKeys(
  pick(
    process.env,
    keysIn(process.env).filter((p) => p.startsWith("CRY_")),
  ),
  (_, key) => camelCase(key.slice(4)),
) as CryEnv;

function base64UrlEncodeObject<T extends Record<string, any>>(payload: T): string {
  return Buffer.from(JSON.stringify(payload))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecodeObject<T extends Record<string, any>>(base64UrlText: string): T {
  const base64Text = base64UrlText.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(Buffer.from(base64Text, "base64").toString("utf8"));
}

async function run(env: CryEnv) {
  const keyUtil = await useKeyUtil(env.privateKey, env.publicKey);

  // randomBytes(32, (err, buf) => {
  //   if (err) throw err;
  //   console.log(`${buf.length} bytes of random data: ${buf.toString("hex")}`);
  // });

  var privateKey = await keyUtil.getPrivateKey();
  var originalHeader = {
    alg: "RS256",
    typ: "JWT",
    kid: "Q0E0QkMwNjE0NEVDNUQwNzgwNjdDRDQyNjNCMTM0M0YzOTcwQzRCMg",
  };
  var originalPayload = {
    userId: "1234567890",
    name: "John Doe",
    admin: true,
    roles: ["admin", "user"],
  };
  var eHeader = base64UrlEncodeObject(originalHeader);
  var ePayload = base64UrlEncodeObject(originalPayload);
  var sign = createSign("RSA-SHA256");
  sign.update(`${eHeader}.${ePayload}`, "utf8");
  sign.end();
  var tokenSignature = sign.sign(privateKey, "hex");
  var jwt = `${eHeader}.${ePayload}.${tokenSignature}`;
  console.log("jwt:\n\n", jwt, "\n\n");

  var jwtParts = jwt.split(".");
  var oHeader = base64UrlDecodeObject(jwtParts[0]);
  console.log("header isEqual:", isEqual(oHeader, originalHeader));

  var oPayload = base64UrlDecodeObject(jwtParts[1]);
  console.log("payload isEqual:", isEqual(oPayload, originalPayload));

  var verify = createVerify("RSA-SHA256");
  verify.update(`${jwtParts[0]}.${jwtParts[1]}`, "utf8");
  verify.end();
  var verified = verify.verify(await keyUtil.getPublicKey(), jwtParts[2], "hex");
  console.log("verified:", verified);
}

run(cryEnvs).catch(console.error);
