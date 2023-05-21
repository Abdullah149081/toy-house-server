const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ignmh8y.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect((err) => {
      if (err) {
        console.error(err);
        return;
      }
    });

    const toyCollection = client.db("toyHouseDB").collection("products");

    const indexKeys = { toyName: 1 };
    const indexOptions = { name: "toyName" };
    await toyCollection.createIndex(indexKeys, indexOptions);

    app.get("/toyProducts", async (req, res) => {
      const result = await toyCollection.find().toArray();
      res.send(result);
    });

    app.get("/toyProducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.get("/toyNameBySearch/:search", async (req, res) => {
      const search = req.params.search;
      const result = await toyCollection
        .find({
          toyName: { $regex: search, $options: "i" },
        })
        .toArray();

      res.send(result);
    });

    app.get("/toyProductsByCategory/:category", async (req, res) => {
      const products = await toyCollection
        .find({
          category: req.params.category,
        })
        .toArray();
      res.send(products);
    });

    app.get("/toyProductsByEmail", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = {
          email: req.query.email,
        };
      }

      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/toyProducts", async (req, res) => {
      const product = req.body;
      const result = await toyCollection.insertOne(product);
      res.send(result);
    });

    app.put("/toyProducts/:id", async (req, res) => {
      const id = req.params.id;
      const product = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateProduct = {
        $set: {
          ...product,
        },
      };

      const result = await toyCollection.updateOne(filter, updateProduct, options);
      res.send(result);
    });

    app.delete("/toyProducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("toy house server is running");
});

app.listen(port, () => {
  console.log(`toy house server is running on port ${port}`);
});
