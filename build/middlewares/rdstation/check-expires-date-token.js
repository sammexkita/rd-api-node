"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/middlewares/rdstation/check-expires-date-token.ts
var check_expires_date_token_exports = {};
__export(check_expires_date_token_exports, {
  checkExpiresDateToken: () => checkExpiresDateToken
});
module.exports = __toCommonJS(check_expires_date_token_exports);
var import_axios2 = __toESM(require("axios"));

// src/database.ts
var import_knex = require("knex");

// src/env/index.ts
var import_config = require("dotenv/config");
var import_zod = require("zod");
var evnSchema = import_zod.z.object({
  DB_HOST: import_zod.z.string(),
  DB_PORT: import_zod.z.string(),
  DB_USER: import_zod.z.string(),
  DB_PASSWORD: import_zod.z.string(),
  DB_NAME: import_zod.z.string(),
  CLIENT_ID: import_zod.z.string(),
  CLIENT_SECRET: import_zod.z.string(),
  CODE: import_zod.z.string(),
  TOKEN_CRM: import_zod.z.string()
});
var _env = evnSchema.safeParse(process.env);
if (_env.success === false) {
  console.error("\u26A0\uFE0F Invalid environment variables", _env.error.format());
  throw new Error("Invalid environment variables");
}
var env = _env.data;

// src/database.ts
var config = {
  client: "mysql2",
  connection: {
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./database/migrations"
  }
};
var knex = (0, import_knex.knex)(config);

// src/utils/rdstation/revalidate-access-token.ts
var import_axios = __toESM(require("axios"));
var import_date_fns_tz = require("date-fns-tz");
var import_date_fns = require("date-fns");
async function RevalidateAccessToken() {
  const { refresh_token } = await knex("rdstation").select("refresh_token").first();
  const { data } = await import_axios.default.post("https://api.rd.services/auth/token", {
    client_id: env.CLIENT_ID,
    client_secret: env.CLIENT_SECRET,
    refresh_token
  });
  const token_expires_at = (0, import_date_fns_tz.format)((0, import_date_fns.addHours)(/* @__PURE__ */ new Date(), 23), "yyyy-MM-dd HH:mm:ss", { timeZone: "America/Sao_Paulo" });
  await knex("rdstation").update({
    token: data.access_token,
    refresh_token: data.refresh_token,
    updated_at: /* @__PURE__ */ new Date(),
    expires_at: token_expires_at
  });
  return data;
}

// src/middlewares/rdstation/check-expires-date-token.ts
var import_date_fns2 = require("date-fns");
async function checkExpiresDateToken() {
  const { expires_at } = await knex("rdstation").select("expires_at").first();
  let isExpired = (0, import_date_fns2.isBefore)(expires_at, /* @__PURE__ */ new Date());
  if (isExpired) {
    return await RevalidateAccessToken();
  }
  const { token } = await knex("rdstation").select("token").first();
  const data = await import_axios2.default.get("https://api.rd.services/platform/contacts/email:leadtest@email.com", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((res) => res.data).catch((err) => err.response.data.error);
  if (data === "invalid_token") {
    return await RevalidateAccessToken();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  checkExpiresDateToken
});
