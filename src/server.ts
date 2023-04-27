import { app } from "./app";

app.listen({
  port: 3333,
}).then(() => {
  console.log("Running on port 3333 🔥");
});