import fastify from "fastify";
import { rdstationmktRoutes } from "./routes/rd";

const app = fastify();

app.register(rdstationmktRoutes, {
  prefix: 'rd',
})

app.listen({
  port: 3333,
}).then(() => {
  console.log("Running on port 3333 🔥");
});