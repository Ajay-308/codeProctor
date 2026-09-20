import dns from "dns";
import { unstable_noStore as noStore } from "next/cache";
import type { MongoClient } from "mongodb";

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const MONGODB_URI = process.env.MONGODB_URL!;
if (!MONGODB_URI) throw new Error("MONGODB_URL not defined in .env");

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise: Promise<MongoClient>;
};

async function getClient() {
  if (!globalWithMongo._mongoClientPromise) {
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(await getMongoUri(), {
      connectTimeoutMS: 3000,
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 3000,
    });
    globalWithMongo._mongoClientPromise = client.connect();
  }

  return globalWithMongo._mongoClientPromise;
}

async function getMongoUri() {
  if (!MONGODB_URI.startsWith("mongodb+srv://")) return MONGODB_URI;

  const withoutScheme = MONGODB_URI.slice("mongodb+srv://".length);
  const slashIndex = withoutScheme.indexOf("/");
  const authority =
    slashIndex === -1 ? withoutScheme : withoutScheme.slice(0, slashIndex);
  const suffix = slashIndex === -1 ? "/" : withoutScheme.slice(slashIndex);
  const atIndex = authority.lastIndexOf("@");
  const credentials = atIndex === -1 ? "" : authority.slice(0, atIndex + 1);
  const host = authority.slice(atIndex + 1);
  const resolver = new dns.Resolver();
  resolver.setServers(["8.8.8.8", "1.1.1.1"]);
  const records = await new Promise<dns.SrvRecord[]>((resolve, reject) => {
    resolver.resolveSrv(`_mongodb._tcp.${host}`, (error, addresses) => {
      if (error) reject(error);
      else resolve(addresses);
    });
  });
  const seedList = records.map(({ name, port }) => `${name}:${port}`).join(",");
  const separator = suffix.includes("?") ? "&" : "?";
  return `mongodb://${credentials}${seedList}${suffix}${separator}tls=true`;
}

async function getCollection() {
  const client = await getClient();
  return client.db("blog_db").collection("notes");
}

export async function getAllBlogs() {
  noStore();
  const collection = await getCollection();
  const blogs = await collection.find({}).sort({ created_at: -1 }).toArray();
  return JSON.parse(JSON.stringify(blogs));
}

export async function getBlogById(id: string) {
  const { ObjectId } = await import("mongodb");
  noStore();
  const collection = await getCollection();
  const blog = await collection.findOne({ _id: new ObjectId(id) });
  if (!blog) return null;
  return JSON.parse(JSON.stringify(blog));
}
