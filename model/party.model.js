import { MongoClient, ObjectId } from 'mongodb';

const mongodbConnectionUrl = process.env.MONGODB_URI_CONNECTION_STRING;
const mongodbDatabaseName = process.env.MONGODB_URI_DATABASE_NAME;
const mongodbCollectionName = process.env.MONGODB_URI_COLLECTION_NAME;

if(!mongodbConnectionUrl
  || !mongodbDatabaseName
  || !mongodbCollectionName) throw new Error("Missing MongoDB connection information");

let client;
let database;
let partiesCollection;

const toJson = (data) => {
  // convert _id to id and clean up
  const idWithoutUnderscore = data._id.toString();
  delete data._id;

  return {
    id: idWithoutUnderscore,
    ...data,
  };
};

// Get all parties from database
// Transform `_id` to `id`
export const getParties = async () => {
  const parties = await partiesCollection.find({}).toArray();
  if (!parties) return [];

  const alteredParties = parties.map((party) => toJson(party));
  console.log(alteredParties);
  return alteredParties;
};
// Get one party by id
export const getPartyById = async (id) => {
  if (!id) return null;

  const party = await partiesCollection.findOne({ _id: new ObjectId(id) });
  return toJson(party);
};
// Delete one party by id
export const deletePartyById = async (id) => {
  if (!id) return null;

  return await partiesCollection.deleteOne({ _id: ObjectId(id) });
};
// Add one party
export const addParty = async (party) => {
  return await partiesCollection.insertOne(party);
};
// Update one party
// Only handles database, image changes are handled in controller
export const updateParty = async (party) => {
  return await partiesCollection.updateOne({ _id: party.id }, { $set: party });
};
// Create database connection
export const connectToDatabase = async () => {

  if (!client || !database || !partiesCollection) {
    // connect
    client = await MongoClient.connect(mongodbConnectionUrl, {
      useUnifiedTopology: true,
    });

    // get database
    database = client.db(mongodbDatabaseName);

    // create collection if it doesn't exist
    const collections = await database.listCollections().toArray();
    const collectionExists = collections.filter((collection) => collection.name === mongodbCollectionName);
    if (!collectionExists) {
      await database.createCollection(mongodbCollectionName);
    }

    // get collection
    partiesCollection = await database.collection(mongodbCollectionName);
  }
};
