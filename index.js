const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require("mongodb");

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
// FIX: Configure CORS to explicitly allow the frontend origin and credentials.
// The frontend (running on port 5173) is sending requests with credentials,
// which is not allowed with the default wildcard origin ('*').
// We now explicitly set the origin and allow credentials.
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection

const uri = `mongodb+srv://studyhub_db_user:${process.env.DB_PASS}@cluster0.vdlyjq3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const db = client.db('sessionsDB');
        const sessionsCollection = db.collection('sessions')

        // GET (Optional) - fetch all sessions

        app.get("/sessions", async (req, res) => {

            const sessions = await sessionsCollection.find().toArray();

            res.json(sessions);

        });

        // // POST: Create a new study session
        app.post("/sessions", async (req, res) => {
            try {
                const sessionData = req.body; // data from frontend form
                const result = await sessionsCollection.insertOne(sessionData);
                res.status(201).json({ success: true, insertedId: result.insertedId });
            } catch (err) {
                res.status(500).json({ success: false, message: err.message });
            }
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


app.get('/', (req, res) => {
    res.send('studysession server running')
})

// Start server
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});





// GET  - fetch all sessions by email
// app.get("/sessions", async (req, res) => {
//     try {
//         const userEmail = req.query.email; // email is passed as a query param
//         const query = userEmail ? { email: userEmail } : {};
//         const options = {
//             // This assumes your documents have a 'createdAt' field.
//             // If not, this sorting will not have an effect.
//             // sort: { createdAt: -1 }, // Latest first
//         };

//         const sessions = await sessionsCollection.find(query, options).toArray();
//         res.json(sessions);
//     } catch (error) {
//         console.error('Error fetching sessions:', error);
//         res.status(500).send({ message: 'Failed to get sessions' });
//     }
// });


