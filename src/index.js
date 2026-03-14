import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./db/connect.js";

dotenv.config();

const port = Number(process.env.PORT || 8000);

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed", error);
    process.exit(1);
  });
