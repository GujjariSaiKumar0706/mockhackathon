const express = require('express');
const app = express();
app.use(express.json());

require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;

MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        const treetagdb = client.db('treetagdb');

        const govcollection = treetagdb.collection('govcollection');
        const orgcollection = treetagdb.collection('orgcollection');
        
        // Share collection objects with the Express app
        app.set('govcollection', govcollection);
        app.set('orgcollection', orgcollection);

        console.log('DB connection successful');
    })
    .catch(err => {
        console.log("Error in DB connection", err);
    });

const govapp = require('./apis/gov-api');
const orgapp = require('./apis/org-api');

app.use('/gov-api', govapp);
app.use('/org-api', orgapp);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).send({ message: "An error occurred", error: err.message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Web server running on port ${port}`));
