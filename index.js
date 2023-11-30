const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// Assigment_12
// banner_img
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wnl4pp8.mongodb.net/?retryWrites=true&w=majority`;

const varifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "Access Deny" });
  }
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Access Deny" });
    }
    req.decoded = decoded;
    next();
  });
};

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
    const ownerProductCollection = client
      .db("Assigment_12")
      .collection("ownerProduct");
    const usersCollection = client.db("Assigment_12").collection("users");

    app.post("/jwt", async (req, res) => {
      const data = req.body;
      const token = jwt.sign(data, process.env.ACCESS_TOKEN, {
        expiresIn: "72h",
      });
      res.send({ token });
    });

    // Check Admin Api
    app.get("/checkAdmin/:email", varifyToken, async (req, res) => {
      const email = req.params.email;
      if (email != req.decoded.email) {
        return res.status(401).send({ message: "Access Deny" });
      }
      const query = { email: email };
      const findAdmin = await usersCollection.findOne(query);

      let isAdmin;
      if (findAdmin) {
        isAdmin = findAdmin.role;
      }
      res.send({ isAdmin });
    });
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

      const query = { featured: true };
      const result = await allProductCollection.find(query).toArray();
      res.send(result);
    });
    // Get Tranding Product item
    app.get("/allProdcut/trandign/:tranding", async (req, res) => {
      const trandingItem = req.params.tranding;
      const options = {
        sort: { votes: -1 },
      };

      const query = { trending: true };
      const result = await allProductCollection.find(query, options).toArray();
      res.send(result);
    });

    // Update Featured Product Vote
    app.patch("/updateFeaturedVote/:id", varifyToken, async (req, res) => {
      const id = req.params.id;
      const { newVote } = req.body;

      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          votes: newVote,
        },
      };
      const result = await allProductCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //Get ALl Product
    app.get("/product", async (req, res) => {
      console.log(req.query);
      const result = await allProductCollection.find().toArray();
      res.send(result);
    });

    // Get Search Product
    app.get("/searchProduct/:search", async (req, res) => {
      const searchs = req.params.search;
      const query = { tags: searchs };
      const result = await allProductCollection.find(query).toArray();
      res.send(result);
    });
    // Get Product Details
    app.get("/productDetails/:id", varifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allProductCollection.findOne(query);
      res.send(result);
    });

    // Report Product
    app.patch("/reportProduct/:id", varifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          report: true,
        },
      };
      const result = await allProductCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // Update Review Product
    app.patch("/updateReview/:id", async (req, res) => {
      const reviews = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          review: reviews,
        },
      };
      const result = await allProductCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // Owner Product Add api
    app.post("/addOwnerproduct", async (req, res) => {
      const body = req.body;
      const result = await ownerProductCollection.insertOne(body);
      res.send(result);
      // const
    });

    // Owner Product get Api
    app.get("/myproduct", async (req, res) => {
      const { email } = req.query;
      const query = { ownerEmail: email };
      const result = await ownerProductCollection.find(query).toArray();
      res.send(result);
    });

    // Delete Owner Product Api
    app.delete("/myproductDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ownerProductCollection.deleteOne(query);
      res.send(result);
    });

    // owner Update Product api

    app.get("/ownerProductget/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ownerProductCollection.findOne(query);
      res.send(result);
    });
    app.patch("/ownerProductUpdate/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const { img, name, description, externalLink } = req.body;
      const updateDoc = {
        $set: {
          img: img,
          name: name,
          description: description,
          externalLink: externalLink,
        },
      };
      const result = await ownerProductCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // Set User DataBase
    app.post("/userRole", async (req, res) => {
      const body = req.body;
      const { email } = body;
      const query = { email: email };
      const exiest = await usersCollection.findOne(query);
      if (exiest) {
        return res.send({ message: "User already Existe", insteredId: null });
      }
      const result = await usersCollection.insertOne(body);
      res.send(result);
    });

    app.get("/alluser", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.patch("/changeUserRole", async (req, res) => {
      const { email, role } = req.body;
      const query = { email: email };
      const updateDoc = {
        $set: {
          email: email,
          role: role,
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    app.delete("/userDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // User add product review
    app.get("/userAddProductReview", async (req, res) => {
      const result = await ownerProductCollection.find().toArray();
      res.send(result);
    });

    // User Product Details
    app.get("/userprodcutdetais/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ownerProductCollection.findOne(query);
      res.send(result);
    });

    // User Product status update
    app.patch("/userProductstatusUpdate/:id", async (req, res) => {
      const id = req.params.id;
      const { statuss } = req.body;

      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: statuss,
        },
      };
      const result = await ownerProductCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // User Product add main data base
    app.post("/userproductAddMaindatabase", async (req, res) => {
      const body = req.body;
      const result = await allProductCollection.insertOne(body);
      res.send(result);
    });

    // All report Product Api
    app.get("/reportProduct", async (req, res) => {
      const query = { report: true };
      const result = await allProductCollection.find(query).toArray();
      res.send(result);
    });

    // Report Product Delete APi
    app.delete("/reportProductDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allProductCollection.deleteOne(query);
      res.send(result);
    });
    // Product Count
    app.get("/getProductCount", async (req, res) => {
      const productresult = await allProductCollection.estimatedDocumentCount();
      const userCount = await usersCollection.estimatedDocumentCount();
      res.send([productresult, userCount]);
    });
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
