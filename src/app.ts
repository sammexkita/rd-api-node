import fastify from "fastify";
import { rdstationmktRoutes } from "./routes/rd";

export const app = fastify();

app.register(rdstationmktRoutes, {
  prefix: 'rd',
})