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

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    const proposalsCollection = database.collection("proposals");
    const paymentsCollection = database.collection("payments");
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
          .find({ status: "Open", state: "accepted" })
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

    // getSingleTaskById
    app.get("/api/task/getSingleTaskById/:id", async (req, res) => {
      try {
        const taskId = req.params.id;
        const result = await tasksCollection.findOne({
          _id: new ObjectId(taskId),
        });
        res.send(result);
      } catch (err) {
        res.status(500).send("Internal Server Error");
      }
    });

    // postTaskProposal
    app.post("/api/task/postTaskProposal", async (req, res) => {
      try {
        const proposalData = req.body;
        console.log("Received proposal data:", proposalData);
        const result = await proposalsCollection.insertOne(proposalData);
        res.send(result);
      } catch (err) {
        res.status(500).send("Internal Server Error");
      }
    });

    // getTaskProposals
    app.get("/api/task/getTaskProposals", async (req, res) => {
      try {
        const result = await proposalsCollection.find({}).toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send("Internal Server Error");
      }
    });

    // getTaskProposalsByEmail
    app.get("/api/task/getTaskProposalsByEmail/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const result = await proposalsCollection
          .find({
            freelancerMail: email,
          })
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send("Internal Server Error");
      }
    });

    // getProposalByClientId
    app.get("/api/task/getProposalByClientId/:id", async (req, res) => {
      try {
        const clientId = req.params.id;
        const result = await proposalsCollection
          .find({
            clientId: clientId,
          })
          .sort({ currentDate: -1 })
          .toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send("Internal Server Error");
      }
    });

    // patchTaskProposalById
    app.patch("/api/task/patchTaskProposalById/:id", async (req, res) => {
      try {
        const proposalId = req.params.id;
        const updatedProposal = req.body;
        const result = await proposalsCollection.updateOne(
          { _id: new ObjectId(proposalId) },
          { $set: updatedProposal },
        );
        res.send(result);
      } catch (err) {
        res.status(500).send("Internal Server Error");
      }
    });

    // postTaskPayment
    app.post("/api/task/postTaskPayment", async (req, res) => {
      try {
        const paymentData = req.body;

        if (!paymentData.proposalId) {
          return res.status(400).json({
            success: false,
            message: "proposalId is required",
          });
        }

        const existingPayment = await paymentsCollection.findOne({
          proposalId: paymentData.proposalId,
        });

        if (existingPayment) {
          return res.status(409).json({
            success: false,
            message: "Payment already exists for this proposal",
          });
        }

        const result = await paymentsCollection.insertOne(paymentData);

        res.status(201).json({
          success: true,
          insertedId: result.insertedId,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({
          success: false,
          message: "Internal Server Error",
        });
      }
    });

    //getInPendingProposalByEmail
    app.get(
      "/api/task/getInPendingProposalByEmail/:email",
      async (req, res) => {
        try {
          const email = req.params.email;
          const result = await proposalsCollection
            .find({
              freelancerMail: email,
              status: "in-progress",
            })
            .toArray();
          res.send(result);
        } catch (err) {
          res.status(500).send("Internal Server Error");
        }
      },
    );

    // getFreelancerPaymentByEmail
    app.get(
      "/api/task/getFreelancerPaymentByEmail/:email",
      async (req, res) => {
        try {
          const email = req.params.email;
          const result = await paymentsCollection
            .find({
              freelancerMail: email,
            })
            .toArray();
          res.send(result);
        } catch (err) {
          res.status(500).send("Internal Server Error");
        }
      },
    );

    //patchUserInfoById
    app.patch("/api/user/patchUserInfoById/:id", async (req, res) => {
      try {
        const userId = req.params.id;
        const updatedUser = req.body;
        console.log("Updating user with ID:", userId);
        console.log("Updated user data:", updatedUser);
        const result = await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: updatedUser },
        );
        res.send(result);
      } catch (err) {
        res.status(500).send("Internal Server Error");
      }
    });

    // getAllPayments
    app.get("/api/task/getAllPayments/admin", async (req, res) => {
      try {
        const result = await paymentsCollection
          .find({})
          .sort({
            paymentDate: -1,
          })
          .toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send("Internal Server Error");
      }
    });

    // checkout-session
    app.post("/api/create-checkout-session", async (req, res) => {
      try {
        console.log("Checkout endpoint called");
        console.log("Body:", req.body);
        console.log("Stripe key exists:", !!process.env.STRIPE_SECRET_KEY);
        const { proposalId } = req.body;
        console.log("Proposal ID received:", proposalId);

        const proposal = await proposalsCollection.findOne({
          _id: new ObjectId(proposalId),
        });
        console.log("Proposal found:", proposal);
        if (!proposal) {
          return res.status(404).json({
            message: "Proposal not found",
          });
        }

        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],

          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: proposal.taskTitle,
                },
                unit_amount: proposal.bid * 100,
              },
              quantity: 1,
            },
          ],

          metadata: {
            proposalId: proposal._id.toString(),
            taskId: proposal.taskId.toString(),
            taskTitle: proposal.taskTitle.toString(),
            clientId: proposal.clientId.toString(),
            freelancerMail: proposal.freelancerMail.toString(),
            deadline: proposal.estimateDeliveryDate.toString(),
          },

          success_url: `${process.env.BASE_URL_CLIENT}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.BASE_URL_CLIENT}/unsuccessful`,
        });

        res.json({
          url: session.url,
        });
      } catch (err) {
        console.log(err);

        res.status(500).json({
          message: err.message,
        });
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
