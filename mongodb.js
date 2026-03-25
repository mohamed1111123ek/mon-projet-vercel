import { MongoClient } from "mongodb";

const globalForMongo = globalThis;

if (!globalForMongo.__mongoCache) {
  globalForMongo.__mongoCache = {
    client: null,
    promise: null,
  };
}

const cache = globalForMongo.__mongoCache;

export async function getMongoClient() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("La variable d'environnement MONGODB_URI est manquante.");
  }

  if (cache.client) {
    return cache.client;
  }

  if (!cache.promise) {
    const client = new MongoClient(uri);

    cache.promise = client
      .connect()
      .then((connectedClient) => {
        cache.client = connectedClient;
        return connectedClient;
      })
      .catch((error) => {
        cache.promise = null;
        throw error;
      });
  }

  return cache.promise;
}

export async function getDatabase() {
  const client = await getMongoClient();
  return client.db("test_db");
}

export default getMongoClient;
