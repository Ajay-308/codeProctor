import { MongoClient } from "mongodb";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

const MONGODB_URI = process.env.MONGODB_URL!;
if (!MONGODB_URI) throw new Error("MONGODB_URL not defined in .env");

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise: Promise<MongoClient>;
};

if (!globalWithMongo._mongoClientPromise) {
  const client = new MongoClient(MONGODB_URI);
  globalWithMongo._mongoClientPromise = client.connect();
}

const clientPromise: Promise<MongoClient> = globalWithMongo._mongoClientPromise;

async function getCollection() {
  const client = await clientPromise;
  return client.db("blog_db").collection("notes");
}

export async function getAllBlogs() {
  const collection = await getCollection();
  const blogs = await collection
    .find({})
    .sort({ created_at: -1 })
    .toArray();
  return JSON.parse(JSON.stringify(blogs));
}

export async function getBlogById(id: string) {
  const { ObjectId } = await import("mongodb");
  const collection = await getCollection();
  const blog = await collection.findOne({ _id: new ObjectId(id) });
  if (!blog) return null;
  return JSON.parse(JSON.stringify(blog));
}