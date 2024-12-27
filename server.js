const express = require('express');
const firebaseAdmin = require('firebase-admin');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;

// Firebase Admin SDK Setup
const serviceAccount = require('/firebase.json'); // Download your Firebase service account key from the Firebase console

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://esp32-4dee4-default-rtdb.firebaseio.com/',
});

const db = firebaseAdmin.database();
const ref = db.ref('/data/moisture'); // Firebase reference for moisture data

// MongoDB Setup
const mongoUri = "mongodb+srv://ffgaming3012:uA1WwufCEOS4xWdW@cluster0.ofuiu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
let mongoClient;

// Connect to MongoDB
async function connectToMongo() {
  try {
    mongoClient = await MongoClient.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// MongoDB database and collection
const dbName = 'wants';  // MongoDB Database Name
const collectionName = 'moistureData';  // MongoDB Collection Name

// Function to insert data into MongoDB
async function insertDataIntoMongo(data) {
  const collection = mongoClient.db(dbName).collection(collectionName);
  try {
    await collection.insertOne(data);
    console.log('Data inserted into MongoDB:', data);
  } catch (error) {
    console.error('Error inserting data into MongoDB:', error);
  }
}

// Firebase Realtime Database listener
ref.on('value', async (snapshot) => {
  const moistureData = snapshot.val();  // Get the new data from Firebase
  if (moistureData !== null) {
    const dataToInsert = {
      moisture: moistureData,
      timestamp: new Date(),
    };

    // Insert data into MongoDB
    await insertDataIntoMongo(dataToInsert);
  }
});

// Express server
app.get('/', (req, res) => {
  res.send('Firebase to MongoDB Data Sync');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  connectToMongo();
});
