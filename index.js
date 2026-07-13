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
        const result = await usersCollection
          .find({})
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send("Internal Server Error");
      }
    });

    // getAllTasks
    app.get("/api/task/alltasks", async (req, res) => {
      try {
        const result = await tasksCollection
          .find({})
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send("Internal Server Error");
      }
    });

    //patchTaskById
    app.patch("/api/task/patch/:id", async (req, res) => {
      try {
        const taskId = req.params.id;
        const updatedTask = req.body;
        const result = await tasksCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: updatedTask },
        );
        res.send(result);
      } catch (err) {
        res.status(500).send("Internal Server Error");
      }
    });

    // ddeleteTaskById
    app.delete("/api/task/delete/:id", async (req, res) => {
      try {
        const taskId = req.params.id;
        const result = await tasksCollection.deleteOne({
          _id: new ObjectId(taskId),
        });
        res.send(result);
      } catch (err) {
        res.status(500).send("Internal Server Error");
      }
    });

    // browseOpenTasks

    app.get("/api/task/browseOpenTasks", async (req, res) => {
      try {
        const { name, skill, page = 1, limit = 9 } = req.query;
        console.log("Query parameters:", req.query);
        const filter = {
          status: "Open",
          state: "accepted",
        };
        if (name) {
          filter.TaskTitle = { $regex: name, $options: "i" };
        }
        if (skill) {
          filter.category = skill;
        }
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 9;
        const skipNum = (pageNum - 1) * limitNum;
        const totalItems = await tasksCollection.countDocuments(filter);
        const result = await tasksCollection
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skipNum)
          .limit(limitNum)
          .toArray();
        res.send({ tasks: result, totalItems });
      } catch (err) {
        res.status(500).send("Internal Server Error");
      }
    });

    //FeatureTaskSix
    app.get("/api/task/featureTaskSix", async (req, res) => {
      try {
        const result = await tasksCollection
          .find({ status: "Open" })
          .sort({
            createdAt: -1,
          })
          .limit(6)
          .toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send("Internal Server Error");
      }
    });

    // await client.db("admin").command({ ping: 1 });
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
