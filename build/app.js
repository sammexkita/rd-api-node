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

// src/app.ts
var app_exports = {};
__export(app_exports, {
  app: () => app
});
module.exports = __toCommonJS(app_exports);
var import_fastify = __toESM(require("fastify"));

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

// src/routes/rd/index.ts
var import_zod2 = require("zod");

// src/middlewares/rdstation/check-expires-date-token.ts
var import_axios2 = __toESM(require("axios"));

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

// src/routes/rd/index.ts
var import_axios3 = __toESM(require("axios"));
async function rdstationmktRoutes(app2) {
  app2.addHook("preHandler", async (req, reply) => {
    await checkExpiresDateToken();
  });
  app2.get("/contacts/:id", async (req, reply) => {
    let key = "";
    const getContactParamsSchema = import_zod2.z.object({
      id: import_zod2.z.string().email().or(import_zod2.z.string().uuid())
    });
    const { id } = getContactParamsSchema.parse(req.params);
    id.includes("@") ? key = "email" : key = "uuid";
    const { token } = await knex("rdstation").select("token").first();
    const data = await import_axios3.default.get(`https://api.rd.services/platform/contacts/${key}:${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((res) => res.data).catch((err) => {
      return reply.send(err.response.data);
    });
    return reply.send(data);
  });
  app2.post("/contacts", async (req, reply) => {
    const createContactSchema = import_zod2.z.object({
      name: import_zod2.z.string().optional(),
      email: import_zod2.z.string().email(),
      personal_phone: import_zod2.z.string().optional()
    });
    const body = createContactSchema.parse(req.body);
    const { token } = await knex("rdstation").select("token").first();
    const rd = await import_axios3.default.post("https://api.rd.services/platform/contacts", body, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).catch((err) => reply.send(err.response.data));
    return reply.send(rd.data);
  });
  app2.patch("/contacts/:email", async (req, reply) => {
    const { token } = await knex("rdstation").select("token").first();
    let key = {};
    const paramsContactParamsSchema = import_zod2.z.object({
      email: import_zod2.z.string().email()
    });
    const { email } = paramsContactParamsSchema.parse(req.params);
    key = email.includes("@") ? {
      name: "email",
      operator: "uuid"
    } : {
      name: "uuid",
      operator: "email"
    };
    const lead = await import_axios3.default.get(`http://localhost:3333/rd/contacts/${email}`).then((res) => res.data).catch((err) => reply.send(err));
    const data = await import_axios3.default.patch(`https://api.rd.services/platform/contacts/${key.operator}:${lead[key.operator]}`, req.body, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((res) => res.data).catch((err) => {
      return reply.send(err.response.data);
    });
    return reply.send(data);
  });
  app2.delete("/contacts/:email", async (req, reply) => {
    const { token } = await knex("rdstation").select("token").first();
    let key = {};
    const paramsContactParamsSchema = import_zod2.z.object({
      email: import_zod2.z.string().email()
    });
    const { email } = paramsContactParamsSchema.parse(req.params);
    key = email.includes("@") ? {
      name: "email",
      operator: "uuid"
    } : {
      name: "uuid",
      operator: "email"
    };
    const lead = await import_axios3.default.get(`http://localhost:3333/rd/contacts/${email}`).then((res) => res.data).catch((err) => reply.send(err));
    const data = await import_axios3.default.delete(`https://api.rd.services/platform/contacts/${key.operator}:${lead[key.operator]}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((res) => res.data).catch((err) => {
      return reply.send(err.response.data);
    });
    return reply.send(data);
  });
}

// src/app.ts
var app = (0, import_fastify.default)();
app.register(rdstationmktRoutes, {
  prefix: "rd"
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
