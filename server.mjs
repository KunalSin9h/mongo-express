import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";

const connectionString = "mongodb://0.0.0.0:27017";

console.log("Staring Server");

async function init() {
  // MongoDB Client
  const client = new MongoClient(connectionString);

  try {
    await client.connect();
  } catch (error) {
    console.log(error);
  }

  const collection = client.db("adoption").collection("pets");

  // Filling the Database
  collection.insertMany(
    Array.from({ length: 10000 }).map((_, index) => ({
      name: [
        "Luna",
        "Fido",
        "Fluffy",
        "Carina",
        "Spot",
        "Beethoven",
        "Baxter",
        "Dug",
        "Zero",
        "Santa's Little Helper",
        "Snoopy",
      ][index % 9],
      type: ["dog", "cat", "bird", "reptile"][index % 4],
      age: (index % 18) + 1,
      breed: [
        "Havanese",
        "Bichon Frise",
        "Beagle",
        "Cockatoo",
        "African Gray",
        "Tabby",
        "Iguana",
      ][index % 7],
      index: index,
    }))
  );

  // Making Indexed (of type "text")
  collection.createIndex({
    name: "text",
    type: "text",
    age: "text",
    breed: "text",
  });

  // Express App
  const app = express();

  app.use(cors());

  app.get("/search", async function (req, res) {
    const pets = await collection
      .find(
        {
          $text: {
            $search: req.query.q,
          },
        },
        { _id: 0 }
      )
      .sort({
        score: {
          $meta: "textScore",
        },
      })
      .limit(10)
      .toArray();

    res
      .json({
        status: "0k",
        pets,
      })
      .end();
  });

  const PORT = 3000;
  app.use(express.static("./static"));
  console.log("Started server on port", PORT);
  app.listen(PORT);
}
await init();
