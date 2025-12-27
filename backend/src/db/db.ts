import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "app.db");
const schemaPath = path.join(__dirname, "schema.sql");

// Initialize database file
const db: Database.Database = new Database(dbPath);

// Load schema and execute it
const schema = fs.readFileSync(schemaPath, "utf8");
db.exec(schema);

export default db;