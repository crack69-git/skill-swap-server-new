import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const database = client.db(process.env.MONGODB_DB_NAME);
    const tasksCollection = database.collection("tasks");
    const usersCollection = database.collection("user");
    // PostATask - task.js
    app.post("/api/task/post", async (req, res) => {
      const task = req.body;
      const result = await tasksCollection.insertOne(task);
      res.send(result);
    });
    app.get("/api/task/get", async (req, res) => {
      const result = await tasksCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });
    // getTaskById
    app.get("/api/task/get/byClient/:id", async (req, res) => {
      try {
        const userId = req.params.id;
        const result = await tasksCollection
          .find({
            clientId: userId,
          })
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send("Internal Server Error");
      }
    });

    // getAllUsers
    app.get("/api/user/allusers", async (req, res) => {
      try {
        const result = await usersCollection.find({}).toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send("Internal Server Error");
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
run();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
