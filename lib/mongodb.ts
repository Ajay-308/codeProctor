import { MongoClient } from "mongodb";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

// ── MongoDB Connection ────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URL!;
console.log(MONGODB_URI);
if (!MONGODB_URI) throw new Error("MONGODB_URL not defined in .env");

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!(global as any)._mongoClientPromise) {
  client = new MongoClient(MONGODB_URI);
  (global as any)._mongoClientPromise = client.connect();
}
clientPromise = (global as any)._mongoClientPromise;

async function getCollection() {
  const client = await clientPromise;
  return client.db("blog_db").collection("notes");
}

// ── getAllBlogs ───────────────────────────────────────────────────────────────
export async function getAllBlogs() {
  const collection = await getCollection();
  const blogs = await collection.find({}).sort({ created_at: -1 }).toArray();
  return JSON.parse(JSON.stringify(blogs));
}

// ── getBlogById ───────────────────────────────────────────────────────────────
export async function getBlogById(id: string) {
  const { ObjectId } = await import("mongodb");
  const collection = await getCollection();
  const blog = await collection.findOne({ _id: new ObjectId(id) });
  if (!blog) return null;
  return JSON.parse(JSON.stringify(blog));
}