require('dotenv').config();

const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
// const mongoose = require('mongoose');
const cors = require('cors');

/**
 * setup the database
 */
const uri = process.env.MONGODB_URI;
const dbClient = new MongoClient(uri);
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: 'http://localhost:3000'
}));

async function verifyAuthorization(req) {
    const token = req.headers.authorization?.split(' ')[1];
    const database = dbClient.db('userData');
    const user = await database.collection('users').findOne({ 
        sessionCookies: { $elemMatch: { cookie: token } }
    });

    return user;
}

app.get('/', (req, res) => {
    res.redirect('localhost:3000');
});

app.post('/register', async (req, res) => {
    console.log("hi")
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmedPassword = req.body.confirmedPassword;
    const tos = req.body.tos;

    if (password !== confirmedPassword) {
        console.log(password, confirmedPassword)
        return res.send({
            success: false,
            error: 'Passwords do not match',
        });
    }

    if (tos === false) {
        return res.send({
            success: false,
            error: 'You must agree to the terms of service',
        });
    }
    const database = dbClient.db('userData');
    const userData = database.collection('users');

    // check if a user with the same username or email already exists
    const usernameQuery = {
        username: username,
    }
    const userWithSameUsername = await userData.findOne(usernameQuery);
    if (userWithSameUsername) {
        return res.send({
            success: false,
            error: 'A user with that username already exists',
        });
    }
    const emailQuery = {
        email: email,
    };
    const userWithSameEmail = await userData.findOne(emailQuery);
    if (userWithSameEmail) {
        return res.send({
            success: false,
            error: 'A user with that email already exists',
        });
    };

    const user = {
        username: username,
        email: email,
        hashedPassword: bcrypt.hashSync(password, 12),
        id: uuidv4(),
        timestampCreated: Date.now(),
        sessionCookies: []
    };

    await userData.insertOne(user);

    function toBase64(string) {
        return Buffer.from(string).toString('base64');
    }

    const sessionCookie = toBase64(user.id) + '.' + toBase64(String(Date.now())) + '.' + uuidv4(); // Basically a Discord Token
    user.sessionCookies.push({ cookie: sessionCookie, timestampCreated: Date.now() });
    await userData.updateOne({ id: user.id }, {
        $set: { sessionCookies: user.sessionCookies }
    });
    res.cookie('session_id', sessionCookie, { /* httpOnly: false, secure: true, */ maxAge: 1209600000 }); // Use secure: true in production

    console.log(user)

    return res.send({
        success: true,
        cookie: sessionCookie,
    });
});

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const rememberMe = req.body.rememberMe;

    const database = dbClient.db('userData');
    const userData = database.collection('users');
    const user = await userData.findOne({ username: username });
    if (!user) {
        return res.send({
            success: false,
            error: 'No user with that username',
        });
    }

    if (!bcrypt.compareSync(password, user.hashedPassword)) {
        return res.send({
            success: false,
            error: 'Incorrect password',
        });
    }

    function toBase64(string) {
        return Buffer.from(string).toString('base64');
    }

    const sessionCookie = toBase64(user.id) + '.' + toBase64(String(Date.now())) + '.' + uuidv4(); // Basically a Discord Token
    user.sessionCookies.push({ cookie: sessionCookie, timestampCreated: Date.now() });
    await userData.updateOne({ id: user.id }, {
        $set: { sessionCookies: user.sessionCookies }
    });

    return res.send({
        success: true,
        cookie: sessionCookie,
    });
});

app.post('/verifyCookie', async (req, res) => {
    const session_id = req.body.session_id;
    const id = req.body.id;

    const database = dbClient.db('userData');
    const userData = database.collection('users');
    console.log(session_id)
    const user = await userData.findOne({ id: id });
    if (!user) {
        return res.send({
            success: false,
            error: 'No user with that id',
        });
    }
    console.log(user);

    const sessionCookie = user.sessionCookies.find(cookie => {
        console.log(cookie.cookie)
        console.log(session_id)
        return cookie.cookie === session_id;
    });
    if (!sessionCookie) {
        return res.send({
            success: false,
            error: 'No session with that token',
        });
    }

    return res.send({
        success: true,
    });
});


// it'd be really funny if someone named themselves "self"
app.get('/profile/self', async (req, res) => {
    // return the database entry of the user that is logged in, without the session cookies and posts limited to 10
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.send({
            success: false,
            error: 'No authorization token provided',
        });
    }
    const token = authorization.split(' ')[1];
    let [id, dateCreated, hashedToken] = token.split('.'); // [id, dateCreated, hashedToken
    id = atob(id);
    const database = dbClient.db('userData');
    const userData = database.collection('users');
    const user = await userData.findOne({ sessionCookies: { $elemMatch: { cookie: token } } });
    if (!user) {
        return res.send({
            success: false,
            error: 'Invalid authorization token',
        });
    }

    const userWithoutSessionCookies = { ...user };
    delete userWithoutSessionCookies.sessionCookies;
    delete userWithoutSessionCookies.hashedPassword;
    if (userWithoutSessionCookies.posts && Array.isArray(userWithoutSessionCookies.posts)) userWithoutSessionCookies.posts = userWithoutSessionCookies.posts.slice(0, 10);


    return res.send({
        success: true,
        user: userWithoutSessionCookies,
    });
});

app.get('/profile/:id', async (req, res) => {
    const id = req.params.id;
    const database = dbClient.db('userData');
    const userData = database.collection('users');
    const user = await userData.findOne({ id: id });
    if (!user) {
        return res.send({
            success: false,
            error: 'No user with that id',
        });
    }

    return res.send({
        success: true,
        user: user,
    });
});


// TODO: Modify for courses / users
app.get('/search', async (req, res) => {
    const query = req.query.q;
    const database = dbClient.db('userData');
    const communities = database.collection('communities');
    const users = database.collection('users');
    const allCommunities = await communities.find().toArray();
    const allUsers = await users.find().toArray();

    const communityResults = allCommunities.filter(community => community.name.includes(query) || community.description.includes(query));
    const userResults = allUsers.filter(user => user.username.includes(query));

    // get all the posts from the communities and users, and filter them by the query
    const allPosts = [];

    for (const community of allCommunities) {
        if (community.posts && typeof community.posts[Symbol.iterator] === 'function') {
            var posts = [...community.posts];
            posts.forEach(post => {
                post.inAProfile = false;
                post.inACommunity = true;
                post.communityId = community.id;
            });
            allPosts.push(...posts);
        }
    }

    for (const user of allUsers) {
        if (user.posts && typeof user.posts[Symbol.iterator] === 'function') {
            var posts = [...user.posts];
            posts.forEach(post => {
                post.inAProfile = true;
                post.inACommunity = false;
            });
            allPosts.push(...posts);
        }
    }

    console.log(allPosts)

    const postResults = allPosts.filter(post => post.title.toLowerCase().includes(query.toLowerCase()) || post.content.toLowerCase().includes(query.toLowerCase()));


    return res.send({
        success: true,
        results: {
            communities: communityResults,
            users: userResults,
            posts: postResults,
        }
    });
});

// Course Routes
app.post('/course/create', async (req, res) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.send({ success: false, error: 'No authorization token provided' });
    }

    if (!verifyAuthorization(req)) return res.send({ success: false, error: 'Unauthorized' });

    const { title, description, tags } = req.body;

    const course = {
        id: uuidv4(),
        title,
        description,
        tags: tags || [],
        creator: user.id,
        dateCreated: Date.now(),
        units: [],
        enrolledStudents: [],
        published: false
    };

    const courses = database.collection('courses');
    await courses.insertOne(course);

    return res.send({
        success: true,
        courseId: course.id
    });
});

app.post('/course/:courseId/unit/create', async (req, res) => {
    const { courseId } = req.params;
    const { title, description, order } = req.body;
    
    // Verify authorization
    if (!verifyAuthorization(req)) return res.send({ success: false, error: 'Unauthorized' });

    const courses = database.collection('courses');
    const course = await courses.findOne({ id: courseId });
    
    if (!course) return res.send({ success: false, error: 'Course not found' });
    if (course.creator !== user.id) return res.send({ success: false, error: 'Not course owner' });

    const unit = {
        id: uuidv4(),
        title,
        description,
        order,
        lessons: [],
        dateCreated: Date.now()
    };

    await courses.updateOne(
        { id: courseId },
        { $push: { units: unit } }
    );

    return res.send({ success: true, unitId: unit.id });
});

app.post('/course/:courseId/unit/:unitId/lesson/create', async (req, res) => {
    const { courseId, unitId } = req.params;
    const { title, content, type } = req.body;
    
    // Verify authorization
    if (!verifyAuthorization(req)) return res.send({ success: false, error: 'Unauthorized' });

    const courses = database.collection('courses');
    const course = await courses.findOne({ id: courseId });
    
    if (!course) return res.send({ success: false, error: 'Course not found' });
    if (course.creator !== user.id) return res.send({ success: false, error: 'Not course owner' });

    const lesson = {
        id: uuidv4(),
        title,
        content,
        type, // 'markdown', 'html', or 'quiz'
        dateCreated: Date.now()
    };

    await courses.updateOne(
        { id: courseId, "units.id": unitId },
        { $push: { "units.$.lessons": lesson } }
    );

    return res.send({ success: true, lessonId: lesson.id });
});

app.post('/course/:courseId/enroll', async (req, res) => {
    const { courseId } = req.params;
    
    // Verify authorization
    if (!verifyAuthorization(req)) return res.send({ success: false, error: 'Unauthorized' });

    const courses = database.collection('courses');
    const course = await courses.findOne({ id: courseId });
    
    if (!course) return res.send({ success: false, error: 'Course not found' });
    if (course.enrolledStudents.includes(user.id)) {
        return res.send({ success: false, error: 'Already enrolled' });
    }

    await courses.updateOne(
        { id: courseId },
        { $push: { enrolledStudents: user.id } }
    );

    // Initialize progress tracking
    const progress = {
        courseId,
        userId: user.id,
        completedLessons: [],
        dateStarted: Date.now()
    };

    await database.collection('progress').insertOne(progress);

    return res.send({ success: true });
});

app.post('/course/:courseId/lesson/:lessonId/complete', async (req, res) => {
    const { courseId, lessonId } = req.params;
    
    // Verify authorization
    const token = req.headers.authorization?.split(' ')[1];
    const database = dbClient.db('userData');
    const user = await database.collection('users').findOne({ 
        sessionCookies: { $elemMatch: { cookie: token } }
    });
    
    if (!user) return res.send({ success: false, error: 'Unauthorized' });

    await database.collection('progress').updateOne(
        { courseId, userId: user.id },
        { $addToSet: { completedLessons: lessonId } }
    );

    return res.send({ success: true });
});

app.get('/course/:courseId', async (req, res) => {
    const { courseId } = req.params;
    const database = dbClient.db('userData');
    const course = await database.collection('courses').findOne({ id: courseId });
    
    if (!course) return res.send({ success: false, error: 'Course not found' });

    return res.send({ success: true, course });
});

app.post('/lessons/create', async (req, res) => {
    const lessonName = req.body.name;
    const lessonDescription = req.body.description;
    const lessonContent = req.body.content;

    if(!verifyAuthorization(req)) return res.send({ success: false, error: 'Unauthorized' });

    if(!lessonName || !lessonDescription || !lessonContent) {
        return res.send({
            success: false,
            error: 'Please fill out all fields',
        });
    }


});

app.listen(9000, () => {
    console.log('Server is running on http://localhost:9000');
});