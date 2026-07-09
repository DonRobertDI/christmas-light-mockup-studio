import { app } from "./app.js";
import { config } from "./config.js";
import { initializeRuntime } from "./runtime.js";

initializeRuntime();

app.listen(config.port, () => {
  console.log(`Mockup Studio API is ready at http://localhost:${config.port}`);
});
