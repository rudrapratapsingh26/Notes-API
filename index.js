import app from "./app.js";
import connectDB from "./src/database/notes.database.js";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

const startServer = async () => {
  try {
    await connectDB();
    app.on("error", (error) => {
      console.log(`ERROR`, error);
      throw error;
    });

    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server start running on port: ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(`MongoDB connection failed`, error);
  }
};

startServer();
