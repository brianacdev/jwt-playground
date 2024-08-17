import "dotenv/config";
import { isEqual, pick, camelCase, keysIn, mapKeys } from "lodash";
import useKeyUtil from "./key-util";
import { base64UrlDecodeObject, base64UrlEncodeObject } from "./base64url";
import { createSign, createVerify, randomBytes, createSecretKey } from "node:crypto";

type CryEnv = { privateKey: string; publicKey: string; secret: string };

function parseEnv<T>(env: Record<string, any>, prefix = "CRY_"): T {
  if (!env) return {} as T;
  var keys = keysIn(env).filter((p) => p.startsWith(prefix));
  var envObj = pick(env, keys);
  return mapKeys(envObj, (_, key) => camelCase(key.slice(prefix.length))) as T;
}

const cryEnvs = parseEnv<CryEnv>(process.env);

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
