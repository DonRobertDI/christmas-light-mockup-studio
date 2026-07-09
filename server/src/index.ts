import { app } from "./app.js";
import { config } from "./config.js";
import { initializeDatabase } from "./db/database.js";
import { ensureUploadDirectories } from "./utils/file.js";

initializeDatabase();
ensureUploadDirectories();

app.listen(config.port, () => {
  console.log(`Mockup Studio API is ready at http://localhost:${config.port}`);
});
