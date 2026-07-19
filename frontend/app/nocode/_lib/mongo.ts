import { MongoClient, type Collection, type Document } from "mongodb";

const mongoUri = process.env.NOCODE_MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const mongoDbName = process.env.NOCODE_MONGODB_DB ?? "judwaa_nocode";

type GlobalMongoState = {
  nocodeMongoClientPromise?: Promise<MongoClient>;
};

const globalMongo = globalThis as typeof globalThis & GlobalMongoState;

const createClientPromise = () => {
  const client = new MongoClient(mongoUri);
  return client.connect();
};

const mongoClientPromise = globalMongo.nocodeMongoClientPromise ?? createClientPromise();

if (process.env.NODE_ENV !== "production") {
  globalMongo.nocodeMongoClientPromise = mongoClientPromise;
}

export const getNocodeCollection = async <T extends Document>(name: string): Promise<Collection<T>> => {
  const client = await mongoClientPromise;
  return client.db(mongoDbName).collection<T>(name);
};
