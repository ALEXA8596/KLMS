require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");

const { MongoClient } = require("mongodb");
const { createPatch } = require("diff");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const uri = process.env.MONGODB_URI;
const dbClient = new MongoClient(uri);

/**
 * setup the database
 */


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

app.get("/profile/self/lessons", async (req, res) => {
  const array = [];
  // get all lessons created by the user that is logged in that aren't children of other lessons. Save each parent lesson in the array with its children and their children's children underneath it
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
  const lessonsDatabase = dbClient.db("lessonsData");
  const lessons = lessonsDatabase.collection("lessons");
  const allLessons = await lessons.find({ creatorId: user.id }).toArray();
  console.log(allLessons);
  const lessonsWithNoParent = allLessons.filter((lesson) => !lesson.parentId);
  console.log(lessonsWithNoParent);
  async function getChildrenRecursive(lessonId) {
    const children = await lessons.find({ parentId: lessonId }).toArray();
    if (children.length === 0) return [];
    
    const childrenWithChildren = await Promise.all(
      children.map(async (child) => ({
        ...child,
        children: await getChildrenRecursive(child.id)
      }))
    );
    
    return childrenWithChildren;
  }

  for (const lesson of lessonsWithNoParent) {
    array.push({
      ...lesson,
      children: await getChildrenRecursive(lesson.id)
    });
  }
  console.log(array);
  return res.send({
    success: true,
    lessons: array,
  });
});

app.get("/profile/:id", async (req, res) => {
  const id = req.params.id;
  const userDatabase = dbClient.db("userData");
  const userData = userDatabase.collection("users");
  const user = await userData.findOne({ id: id });
  if (!user) {
    return res.send({
      success: false,
      error: "No user with that id",
    });
  }

  const lessonDatabase = dbClient.db("lessonsData");
  const lessons = lessonDatabase.collection("lessons");
  const lessonsCreated = await lessons.find({ creatorId: id }).toArray();
  
  const lessonsCreatedWithNoParent = lessonsCreated.filter(
    (lesson) => !lesson.parentId
  );

  user.lessons = lessonsCreatedWithNoParent.map((lesson) => ({
    id: lesson.id,
    name: lesson.name,
    description: lesson.description,
    dateCreated: lesson.dateCreated,
  }));


  return res.send({
    success: true,
    user: user,
  });
});

app.get("/search", async (req, res) => {
  const query = req.query.q;
  console.log(query);
  const userDb = dbClient.db("userData");
  const lessonDb = dbClient.db("lessonsData");
  const users = userDb.collection("users");
  const lessons = lessonDb.collection("lessons");

  const allUsers = await users.find().toArray();
  console.log(allUsers);
  const allLessons = await lessons.find().toArray();
  console.log(allLessons);

  // Filter users by username
  const userResults = allUsers.filter((user) => 
    user.username.toLowerCase().includes(query.toLowerCase())
  ).map(user => ({
    id: user.id,
    username: user.username
  }));

  console.log(userResults);

  // Filter lessons by name, description and content
  const lessonResults = allLessons.filter((lesson) =>
    lesson.name.toLowerCase().includes(query.toLowerCase()) ||
    lesson.description.toLowerCase().includes(query.toLowerCase()) ||
    lesson.content.toLowerCase().includes(query.toLowerCase())
  ).map(lesson => ({
    id: lesson.id,
    name: lesson.name,
    description: lesson.description,
    creatorId: lesson.creatorId,
    dateCreated: lesson.dateCreated
  }));

  return res.send({
    success: true,
    results: {
      users: userResults || [],
      lessons: lessonResults || [],
    }
  });
});

app.post("/lessons/create", async (req, res) => {

  const { name, description, content, parentId } = req.body;

  const user = await verifyAuthorization(req);
  if (!user)
    return res.send({ success: false, error: "Unauthorized" });

  if (!name || !description || !content) {
    return res.send({
      success: false,
      error: "Please fill out all fields",
    });
  }

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


app.get('/api/lesson/:id/tree', async (req, res) => {
  const id = req.params.id;
  const database = dbClient.db('lessonsData');
  const lessons = database.collection('lessons');
  console.log('hierarchy');
  const lesson = await lessons.findOne({ id: id });
  if (!lesson) {
    return res.send({ success: false, error: 'No lesson with that id' });
  }

  // Recursive function to fetch all parents and build the hierarchy
  async function buildHierarchy(lessonId, visited = new Set()) {
    console.log(lessonId);
    if (visited.has(lessonId)) return null; // Prevent circular references
    visited.add(lessonId);

    const currentLesson = await lessons.findOne({ id: lessonId });
    if (!currentLesson) return null;

    const parentHierarchy = currentLesson.parentId && !visited.has(currentLesson.parentId)
      ? await buildHierarchy(currentLesson.parentId, visited)
      : null;

    const children = await lessons.find({ parentId: lessonId }).toArray();
    const childHierarchy = await Promise.all(
      children.map(async (child) => ({
        id: child.id,
        name: child.name,
        children: await buildHierarchy(child.id, new Set(visited)),
      }))
    );

    const currentNode = {
      id: currentLesson.id,
      name: currentLesson.name,
      children: childHierarchy,
    };

    return parentHierarchy ? { ...parentHierarchy, children: [currentNode] } : currentNode;
  }

  const hierarchy = await buildHierarchy(id);

  console.log(hierarchy);

  return res.send({
    success: true,
    tree: hierarchy,
  });
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
