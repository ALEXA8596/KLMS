import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

const uri = process.env.MONGODB_URI as string; // Set your MongoDB Atlas URI in .env.local

// Global variable to cache the MongoDB client
let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
  });

  await client.connect();
  cachedClient = client;
  return client;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "username",
          type: "username",
          placeholder: "Jane Doe",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials, req) {
        console.log(credentials);
        console.log(req);

        if (
          !credentials.username ||
          !credentials.password ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        try {
          const client = await connectToDatabase();
          const db = client.db("userData"); // Replace with your DB name
          const users = db.collection("users");

          const user = await users.findOne({ username: credentials.username });

          if (!user || typeof user.hashedPassword !== "string") {
            return null;
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.hashedPassword
          );

          if (!passwordMatch) {
            return null;
          }

          // user.email = user.username;
          user.name = user.username;

          // If no error and we have user data, return it
          if (user) {
            console.log(user);
            return {
              name: user.username,
              id: user.id,
              email: user.email
            };
          }
          // Return null if user data could not be retrieved
          return null;
        } catch (error) {
          console.error("Database connection error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      console.log("Session Callback");
      console.log("Session:", session);
      console.log("Token:", token);
      
      // Add user ID to session from token
      if (token?.sub) {
        session.user.id = token.sub;
      }
      
      return session;
    },
    async jwt({ token, user, account, profile, trigger, session}) {
      console.log("JWT Callback");
      console.log(token);
      if (user) {
        // First time JWT callback is invoked, user object is available
        token.sub = user.id;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
