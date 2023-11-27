const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// Assigment_12
// banner_img
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wnl4pp8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // Send a ping to confirm a successful connection

    const banner_itemCollection = client
      .db("Assigment_12")
      .collection("banner_item");
    const weblogo_imgCollection = client
      .db("Assigment_12")
      .collection("weblogo");
    const allProductCollection = client
      .db("Assigment_12")
      .collection("allProduct");

    //   Get Web Logo Img
    app.get("/weblogo", async (req, res) => {
      const result = await weblogo_imgCollection.find().toArray();
      res.send(result);
    });

    // Get Banner Item
    app.get("/banneritem", async (req, res) => {
      const result = await banner_itemCollection.find().toArray();
      res.send(result);
    });

    // Get Featured Product item
    app.get("/allProdcut/featured/:featuredItem", async (req, res) => {
      const featuredItem = req.params.featuredItem;

      const query = { featured: featuredItem };
      const result = await allProductCollection.find(query).toArray();
      res.send(result);
    });
    // Get Tranding Product item
    app.get("/allProdcut/trandign/:tranding", async (req, res) => {
      const trandingItem = req.params.tranding;

      const query = { trending: trandingItem };
      const result = await allProductCollection.find(query).toArray();
      res.send(result);
    });

    // Update Featured Product Vote
    app.patch("/updateFeaturedVote/:id", async (req, res) => {
      const id = req.params.id;
      const { newVote } = req.body;
      console.log(newVote);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          votes: newVote,
        },
      };
      const result = await allProductCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Server is running");
});
app.listen(port, () => {
  console.log("Server is running");
});
