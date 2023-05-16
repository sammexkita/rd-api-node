"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/database.ts
var database_exports = {};
__export(database_exports, {
  config: () => config,
  knex: () => knex
});
module.exports = __toCommonJS(database_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  config,
  knex
});
