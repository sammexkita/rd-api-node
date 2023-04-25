import { Knex, knex as setupKnex } from "knex";
import { env } from "./env";

export const config: Knex.Config = {
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

export const knex = setupKnex(config);