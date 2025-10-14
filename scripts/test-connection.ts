import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
const result = config({ path: resolve(process.cwd(), ".env.local") });

if (result.error) {
  console.error("Error loading .env.local:", result.error);
  process.exit(1);
}

console.log("Environment variables loaded from .env.local");
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);

import connectDB from "@/lib/mongodb";

async function testConnection() {
  try {
    console.log("Testing MongoDB connection...");
    await connectDB();
    console.log("✅ Successfully connected to MongoDB Atlas!");
    console.log("Database connection is working properly.");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:");
    console.error(error);
  } finally {
    process.exit(0);
  }
}

testConnection();
