const { MongoClient } = require('mongodb');
require("dotenv").config({ path: "./.env" });


const db = process.env.DB_URL
console.log(db)

async function run() {
    try {
        const client = new MongoClient(db);
        await client.connect();
        console.log("Connected successfully to MongoDB");
    } catch (error) {
        console.error("Connection failed", error);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
