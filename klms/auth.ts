import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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

        const res = await fetch(
          `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/login`,
          {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" },
          }
        );
        const user = await res.json();

        console.log(user);

        // user.email = user.username;
        user.name = user.username;


        // If no error and we have user data, return it
        if (res.ok && user) {
          return {
            name: user.username,
            id: user.id,
          };
        }
        // Return null if user data could not be retrieved
        return null;
      },
    }),
  ],
  callbacks: {
    session({ session, user, token }) {
      console.log("Session Callback");
      console.log(session);
      console.log(user);
      console.log(token);
      //   console.log("User:")
      //   console.log(user)
      //   console.log("Session:")
      //   console.log(session)
      //   console.log("Token:")
      //   console.log(token)
        // session.user.id = token?.sub || "";
      return session;
    },
    async jwt({ token, user }) {
      console.log("JWT Callback");
      console.log(token);
      // console.log(user);
      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
});
