import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cors());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const db = client.db(process.env.MONGODB_DB_NAME);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.error(err);
  }
}

app.get("/", (req, res) => {
  res.send("Welcome to the Skillswap API!");
});
export async function disconnectFromMongoDB() {
  await client.close();
}

connectToMongoDB();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
