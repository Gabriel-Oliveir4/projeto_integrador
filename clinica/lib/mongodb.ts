import mongoose from "mongoose";

// Lê a URL de conexão do env local 
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI não encontrada no .env.local");
}

//cache para evitar varias chamadas de conexão
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    //se ja tiver conexão, usa ela, se não, cria uma nova conexão
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    console.log("TENTANDO CONECTAR:", MONGODB_URI);
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;