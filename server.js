import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

let db;

async function connectToDb() {
  try {
    await client.connect();
    db = client.db("store");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Could not connect to MongoDB:", error);
  }
}

connectToDb();

app.get("/api/products", async (req, res) => {
  try {
    const products = await db.collection("products").find({}).toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const product = req.body;
    const result = await db.collection("products").insertOne(product);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const result = await db.collection("products").deleteOne({
      _id: new ObjectId(req.params.id),
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
