const express = require('express');
const firebaseAdmin = require('firebase-admin');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;

// Firebase Admin SDK Setup
const serviceAccount = {
  type: "service_account",
  project_id: "esp32-4dee4",
  private_key_id: "ac85edea448d5d9cc02ce2357f22a796ec004cd5",
  private_key: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCcueOnQyz9qjEB\niPpfXvisJbH1PWqXbPW0Ej11Saf0t2QA2sJf5HTg06VRLK2mOaB8L3PSNgjbc2s4\nYa4xhZonccx4f6xeO0FvMXWA5jBt8exF1/AJMOdilC7aziqBIc7IGr2y2x4PpUcf\nxm0MdGB9yeyrVef3i2j2+j/lq8pGNm3qaxJyy6xDLwHeenHIZ5BxAONZTbrWlDXD\nFqvPqMfVIhQpUzy01AUdLeYuBwFHDOZsa+0yvFxS330G/zCD3Rg8/zS078zGfRSB\ndfmkEcCTprMUDtFpKc0511xytbV65b9IdcoFqntMecnBx0gCt9ohL6u4pjbjRz1r\n2tLIWL3LAgMBAAECggEADk5/xBCDRmKnV5MH+/XA8IH+ZTsmhE0rfrUdjBvdq56k\nD9noXXWO38kiMa9I6MAg8MUqJvnMxC+cjYiJLLcb89bVCfjppK53Ei3rIomgySCI\n53VHUad3r82EG3AvfBs4c5bRU0biTx5QyEtGQBlNh54LrzZH1xaQTd9ZPt94NwFz\nPlfggT7712OlBY0jHETLCrLspLIgbVkT1VyRqXbHez7NNKZ6YgLNtv/Mws6ve2r4\nAviDx/K/kPolW/TCaI3nzoobaR2kOSBhs0yuteUFZ8ImtDihAp6CumIKIdkeb5ZS\nQAaGhnB0QMyfAp4jxRHDCgizf8B9Dmv1JPI0mJGQkQKBgQDbK+FM4RhxGd6KZUPr\nynM66koCI4SZDDY+gaIaPpmofwr9jSyC4z8nKGwUTfnrKBnNg89cSusXwUiZIhbC\n0Wr2qO1+Vo3dUwt7fkXhrJpE+QXYpUO0EQ9v53gn+peQDgAeN9a2+TgP68+2/zi5\n3uNcGWJaya+nWaklUpylj1JXEQKBgQC3D8tFRmi0vMY7jpoXnYyjFgu98d0yKMlH\ncxOEPFWfqrg4wnaSxZ0CVleqGI8+5ZF+MtqJ6SSKGF+cUjE4/GW/vPBQ1hxie/9f\njqD/nXHoN9z6FSGLIu8F969wNf6C2gwKnd0/jaKjH8FLugN3Yyj6u8tIOjZkc00b\nwurhmTafGwKBgQCVBBWwXs9ufsdHU6jFlaWZJhjhsWKDaMEs6JjdvTheTtqbIDRm\nXbnfluU9PPMyhtZcXEVNnAaR5THGJF5TYW2Xfa3UG2djVwZUlbtPwDo3sRTfgyYw\nNPVJAZk5nXEVWd+MrCyJxZLviEZ3Rro77iapxPyRe9W5NAYEQVIOYw758QKBgDGq\nulbYTI5E7W+5N/uSRlb1I0hst7vlLv8QrMni6MRCOGtF74/Qx9GbhXtj4HGLLZdU\nytBCDiTdigtKjYpNiHmmFHmKLfdWdyoA85OGryH3DiBX3Vr3pmwzEElcjOoJqNy0\nihO1JNwnQHWASXJ51+N3UicNjDZixhfzIXEF9bjjAoGABRWiaicTb9V/b6NWtbdm\n6P0iDPD4uRGcwYDYqTE41wpZmfSRvardPMmntWH13YK1QmIIeGGp9LZJD/7+T/Xn\nurB4GsOizQQhWKk8usLIsjw4LnLLmaA2DnqOOou1yhmdHifN9IShPZbDnALwwrhn\n5VZf1pcsuhaxdzv5XfBYimM=\n-----END PRIVATE KEY-----\n`,
  client_email: "firebase-adminsdk-aqcrq@esp32-4dee4.iam.gserviceaccount.com",
  client_id: "108665888126147806364",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-aqcrq%40esp32-4dee4.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
}; // Download your Firebase service account key from the Firebase console

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
