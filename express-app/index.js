require("dotenv").config();

const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
// const mongoose = require('mongoose');
const cors = require("cors");
const { createPatch } = require("diff");

/**
 * setup the database
 */
const uri = process.env.MONGODB_URI;
const dbClient = new MongoClient(uri);
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

async function verifyAuthorization(req) {
  const token = req.headers.authorization?.split(" ")[1];
  const database = dbClient.db("userData");
  const user = await database.collection("users").findOne({
    sessionCookies: { $elemMatch: { cookie: token } },
  });

  return user;
}

app.get("/", (req, res) => {
  res.redirect("localhost:3000");
});

app.post("/register", async (req, res) => {
  console.log("hi");
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const confirmedPassword = req.body.confirmedPassword;
  const tos = req.body.tos;

  if (password !== confirmedPassword) {
    console.log(password, confirmedPassword);
    return res.send({
      success: false,
      error: "Passwords do not match",
    });
  }

  if (tos === false) {
    return res.send({
      success: false,
      error: "You must agree to the terms of service",
    });
  }
  const database = dbClient.db("userData");
  const userData = database.collection("users");

  // check if a user with the same username or email already exists
  const usernameQuery = {
    username: username,
  };
  const userWithSameUsername = await userData.findOne(usernameQuery);
  if (userWithSameUsername) {
    return res.send({
      success: false,
      error: "A user with that username already exists",
    });
  }
  const emailQuery = {
    email: email,
  };
  const userWithSameEmail = await userData.findOne(emailQuery);
  if (userWithSameEmail) {
    return res.send({
      success: false,
      error: "A user with that email already exists",
    });
  }

  const user = {
    username: username,
    email: email,
    hashedPassword: bcrypt.hashSync(password, 12),
    id: uuidv4(),
    timestampCreated: Date.now(),
    sessionCookies: [],
  };

  await userData.insertOne(user);

  function toBase64(string) {
    return Buffer.from(string).toString("base64");
  }

  const sessionCookie =
    toBase64(user.id) + "." + toBase64(String(Date.now())) + "." + uuidv4(); // Basically a Discord Token
  user.sessionCookies.push({
    cookie: sessionCookie,
    timestampCreated: Date.now(),
  });
  await userData.updateOne(
    { id: user.id },
    {
      $set: { sessionCookies: user.sessionCookies },
    }
  );
  res.cookie("session_id", sessionCookie, {
    /* httpOnly: false, secure: true, */ maxAge: 1209600000,
  }); // Use secure: true in production

  console.log(user);

  return res.send({
    success: true,
    cookie: sessionCookie,
  });
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  //   const rememberMe = req.body.rememberMe;

  const database = dbClient.db("userData");
  const userData = database.collection("users");
  const user = await userData.findOne({ username: username });
  if (!user) {
    return res.send({
      success: false,
      error: "No user with that username",
    });
  }

  if (!bcrypt.compareSync(password, user.hashedPassword)) {
    return res.send({
      success: false,
      error: "Incorrect password",
    });
  }

  function toBase64(string) {
    return Buffer.from(string).toString("base64");
  }

  const sessionCookie =
    toBase64(user.id) + "." + toBase64(String(Date.now())) + "." + uuidv4(); // Basically a Discord Token
  user.sessionCookies.push({
    cookie: sessionCookie,
    timestampCreated: Date.now(),
  });
  await userData.updateOne(
    { id: user.id },
    {
      $set: { sessionCookies: user.sessionCookies },
    }
  );

  return res.send({
    success: true,
    cookie: sessionCookie,
  });
});

app.post("/verifyCookie", async (req, res) => {
  const session_id = req.body.session_id;
  const id = req.body.id;

  const database = dbClient.db("userData");
  const userData = database.collection("users");
  console.log(session_id);
  const user = await userData.findOne({ id: id });
  if (!user) {
    return res.send({
      success: false,
      error: "No user with that id",
    });
  }
  console.log(user);

  const sessionCookie = user.sessionCookies.find((cookie) => {
    console.log(cookie.cookie);
    console.log(session_id);
    return cookie.cookie === session_id;
  });
  if (!sessionCookie) {
    return res.send({
      success: false,
      error: "No session with that token",
    });
  }

  return res.send({
    success: true,
  });
});

// it'd be really funny if someone named themselves "self"
app.get("/profile/self", async (req, res) => {
  // return the database entry of the user that is logged in, without the session cookies and posts limited to 10
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.send({
      success: false,
      error: "No authorization token provided",
    });
  }
  const token = authorization.split(" ")[1];
  let [id, dateCreated, hashedToken] = token.split("."); // [id, dateCreated, hashedToken
  id = atob(id);
  const database = dbClient.db("userData");
  const userData = database.collection("users");
  const user = await userData.findOne({
    sessionCookies: { $elemMatch: { cookie: token } },
  });
  if (!user) {
    return res.send({
      success: false,
      error: "Invalid authorization token",
    });
  }

  const userWithoutSessionCookies = { ...user };
  delete userWithoutSessionCookies.sessionCookies;
  delete userWithoutSessionCookies.hashedPassword;
  if (
    userWithoutSessionCookies.posts &&
    Array.isArray(userWithoutSessionCookies.posts)
  )
    userWithoutSessionCookies.posts = userWithoutSessionCookies.posts.slice(
      0,
      10
    );

  return res.send({
    success: true,
    user: userWithoutSessionCookies,
  });
});

app.get("/profile/:id", async (req, res) => {
  const id = req.params.id;
  const database = dbClient.db("userData");
  const userData = database.collection("users");
  const user = await userData.findOne({ id: id });
  if (!user) {
    return res.send({
      success: false,
      error: "No user with that id",
    });
  }

  return res.send({
    success: true,
    user: user,
  });
});

// TODO: Modify for courses / users
app.get("/search", async (req, res) => {
  const query = req.query.q;
  const database = dbClient.db("userData");
  const communities = database.collection("communities");
  const users = database.collection("users");
  const allCommunities = await communities.find().toArray();
  const allUsers = await users.find().toArray();

  const communityResults = allCommunities.filter(
    (community) =>
      community.name.includes(query) || community.description.includes(query)
  );
  const userResults = allUsers.filter((user) => user.username.includes(query));

  // get all the posts from the communities and users, and filter them by the query
  const allPosts = [];

  for (const community of allCommunities) {
    if (
      community.posts &&
      typeof community.posts[Symbol.iterator] === "function"
    ) {
      var posts = [...community.posts];
      posts.forEach((post) => {
        post.inAProfile = false;
        post.inACommunity = true;
        post.communityId = community.id;
      });
      allPosts.push(...posts);
    }
  }

  for (const user of allUsers) {
    if (user.posts && typeof user.posts[Symbol.iterator] === "function") {
      var posts = [...user.posts];
      posts.forEach((post) => {
        post.inAProfile = true;
        post.inACommunity = false;
      });
      allPosts.push(...posts);
    }
  }

  console.log(allPosts);

  const postResults = allPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.content.toLowerCase().includes(query.toLowerCase())
  );

  return res.send({
    success: true,
    results: {
      communities: communityResults,
      users: userResults,
      posts: postResults,
    },
  });
});

app.post("/lessons/create", async (req, res) => {
  // const lessonName = req.body.name;
  // const lessonDescription = req.body.description;
  // const lessonContent = req.body.content;

  const { name, description, content, parentId } = req.body;

  if (!verifyAuthorization(req))
    return res.send({ success: false, error: "Unauthorized" });

  if (!name || !description || !content) {
    return res.send({
      success: false,
      error: "Please fill out all fields",
    });
  }


  const user = await verifyAuthorization(req);

  const database = dbClient.db("lessonsData");

  const lessons = database.collection("lessons");


  // Check if parent exists and validate tree height
  let parentLesson = null;
  if (parentId) {
    parentLesson = await lessons.findOne({ id: parentId });
    if (!parentLesson) {
      return res.send({ success: false, error: 'Parent lesson not found' });
    }
    const parentHeight = parentLesson.treeHeight || 1;
    if (parentHeight >= 4) {
      return res.send({ success: false, error: 'Maximum tree height exceeded' });
    }
  }


  const lesson = {
    id: uuidv4(),
    name,
    description,
    content,
    creatorId: user.id,
    dateCreated: Date.now(),
    parentId: parentId || null,
    treeHeight: parentLesson ? parentLesson.treeHeight + 1 : 1,
    version: 1,
    patches: [], // Array to store version patches
    history: [
      {
        version: 1,
        timestamp: Date.now(),
        creatorId: user.id,
        changelog: "Initial version",
      },
    ],
    children: [], // Array to store child lesson IDs
  };

  await lessons.insertOne(lesson);
  if (parentLesson) {
    await lessons.updateOne(
      { id: parentId },
      { $push: { children: lesson.id } }
    );
  }
  return res.send({
    success: true,
    lessonId: lesson.id,
  });
});




app.get("/api/lessons/:id", async (req, res) => {
  const id = req.params.id;
  const database = dbClient.db("lessonsData");
  const lessons = database.collection("lessons");
  const lesson = await lessons.findOne({ id: id });

  if (!lesson) {
    return res.send({
      success: false,
      error: "No lesson with that id",
    });
  };

  const usersDatabase = dbClient.db("userData");
  const author = await usersDatabase
    .collection("users")
    .findOne({ id: lesson.creatorId });

  // Fetch parent and children details
  const parent = lesson.parentId ? await lessons.findOne({ id: lesson.parentId }) : null;
  const children = lesson.children.length > 0 ? await lessons.find({ id: { $in: lesson.children } }).toArray() : [];

  return res.send({
    success: true,
    lesson: {
      ...lesson,
      parent: parent ? { id: parent.id, name: parent.name } : null,
      children: children.map(child => ({ id: child.id, name: child.name })),
      creatorName: author ? author.username : 'Unknown Author',
    },
  });
});

app.put('/api/lesson/:id', async (req, res) => {
  if (!verifyAuthorization(req)) return res.send({ success: false, error: 'Unauthorized' });

  const { id } = req.params;
  const { content, description } = req.body;
  const user = await verifyAuthorization(req);

  const database = dbClient.db('lessonsData');
  const lessons = database.collection('lessons');

  const currentLesson = await lessons.findOne({ id });
  if (!currentLesson) {
    return res.send({ success: false, error: 'Lesson not found' });
  }

  // Generate patch from previous to new content
  const patch = createPatch(
    `lesson_${id}`,
    currentLesson.content,
    content,
    'Previous Version',
    'New Version'
  );

  const namePatch = createPatch(
    `lesson_${id}_name`,
    currentLesson.name,
    name,
    'Previous Version',
    'New Version'
  );

  const descriptionPatch = createPatch(
    `lesson_${id}_description`,
    currentLesson.description,
    description,
    'Previous Version',
    'New Version'
  );

  // Update lesson with new content and store patch
  await lessons.updateOne(
    { id },
    {
      $set: {
        content,
        description
      },
      $push: {
        patches: { content: patch, name: namePatch, description: descriptionPatch },
        history: {
          version: currentLesson.version + 1,
          timestamp: Date.now(),
          creatorId: user.id,
          changelog: req.body.changelog || 'No changelog provided'
        }
      },
      $inc: { version: 1 }
    }
  );

  return res.send({ success: true });
});

// Refactor lesson deletion to handle parent-child relationships
app.delete('/api/lesson/:id', async (req, res) => {
  const id = req.params.id;
  const database = dbClient.db('lessonsData');
  const lessons = database.collection('lessons');

  const lesson = await lessons.findOne({ id: id });
  if (!lesson) {
      return res.send({ success: false, error: 'No lesson with that id' });
  }

  // Remove lesson from parent's children array
  if (lesson.parentId) {
      await lessons.updateOne(
          { id: lesson.parentId },
          { $pull: { children: id } }
      );
  }

  // Recursively delete all children
  async function deleteChildren(lessonId) {
      const childLessons = await lessons.find({ parentId: lessonId }).toArray();
      for (const child of childLessons) {
          await deleteChildren(child.id);
      }
      await lessons.deleteOne({ id: lessonId });
  }

  await deleteChildren(id);

  return res.send({ success: true });
});

const { applyPatch } = require('diff');

app.get('/api/lesson/:id/version/:version', async (req, res) => {
  const { id, version } = req.params;
  const database = dbClient.db('lessonsData');
  const lessons = database.collection('lessons');

  const lesson = await lessons.findOne({ id });
  if (!lesson) {
    return res.send({ success: false, error: 'Lesson not found' });
  }

  // If requesting current version, return as is
  if (parseInt(version) === lesson.version) {
    return res.send({ success: true, content: lesson.content, name: lesson.name, description: lesson.description });
  }

  // Otherwise reconstruct the requested version
  let content = lesson.content;
  let name = lesson.name;
  let description = lesson.description;
  const targetVersion = parseInt(version);

  // Apply patches in reverse to get to the requested version
  for (let i = lesson.patches.length - 1; i >= targetVersion - 1; i--) {
    content = applyPatch(content, lesson.patches[i]);
    name = applyPatch(name, lesson.patches[i].name);
    description = applyPatch(description, lesson.patches[i].description);
  }

  return res.send({
    success: true,
    content,
    name,
    description,
    versionInfo: lesson.history[targetVersion - 1]
  });
});

app.get("/api/lesson/:id/versions", async (req, res) => {
  const { id } = req.params;
  const database = dbClient.db('lessonsData');
  const lessons = database.collection('lessons');

  const lesson = await lessons.findOne({ id });
  if (!lesson) {
    return res.send({ success: false, error: 'Lesson not found' });
  }

  // Build versions array with content
  const versions = [];
  for (let i = 0; i < lesson.history.length; i++) {
    const version = lesson.history[i];
    let content = lesson.content;

    // Apply patches in reverse to get historical content
    for (let j = lesson.patches.length - 1; j >= i; j--) {
      content = applyPatch(content, lesson.patches[j]);
    }

    versions.push({
      version: version.version,
      timestamp: version.timestamp,
      name: lesson.name,
      description: version.description,
      content: content,
      changelog: version.changelog || 'No changelog provided'
    });
  }

  return res.send({
    success: true,
    versions: versions
  });
});

app.listen(9000, () => {
  console.log("Server is running on http://localhost:9000");
});
