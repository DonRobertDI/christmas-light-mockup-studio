import { app } from "./app.js";
import { config } from "./config.js";
import { initializeDatabase } from "./db/database.js";
import { ensureUploadDirectories } from "./utils/file.js";

initializeDatabase();
ensureUploadDirectories();

app.listen(config.port, "0.0.0.0", () => {
  console.log(`Mockup Studio is ready on port ${config.port}`);
});
