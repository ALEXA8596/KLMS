import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { getToken } from "next-auth/jwt";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// POST /api/quizzes/create
export async function POST(request: NextRequest) {
  //   {
  //     quizTitle: "React Quiz Component Demo",
  //     quizSynopsis:
  //       "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim",
  //     progressBarColor: "#9de1f6",
  //     nrOfQuestions: "4",
  //     questions: [
  //       {
  //         question:
  //           "How can you access the state of a component from inside of a member function?",
  //         questionType: "text",
  //         questionPic: "https://dummyimage.com/600x400/000/fff&text=X", // if you need to display Picture in Question
  //         answerSelectionType: "single",
  //         answers: [
  //           "this.getState()",
  //           "this.prototype.stateValue",
  //           "this.state",
  //           "this.values",
  //         ],
  //         correctAnswer: "3",
  //         messageForCorrectAnswer: "Correct answer. Good job.",
  //         messageForIncorrectAnswer: "Incorrect answer. Please try again.",
  //         explanation:
  //           "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  //         point: "20",
  //       },
  //       {
  //         question: "ReactJS is developed by _____?",
  //         questionType: "text",
  //         answerSelectionType: "single",
  //         answers: ["Google Engineers", "Facebook Engineers"],
  //         correctAnswer: "2",
  //         messageForCorrectAnswer: "Correct answer. Good job.",
  //         messageForIncorrectAnswer: "Incorrect answer. Please try again.",
  //         explanation:
  //           "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  //         point: "20",
  //       },
  //       {
  //         question: "ReactJS is an MVC based framework?",
  //         questionType: "text",
  //         answerSelectionType: "single",
  //         answers: ["True", "False"],
  //         correctAnswer: "2",
  //         messageForCorrectAnswer: "Correct answer. Good job.",
  //         messageForIncorrectAnswer: "Incorrect answer. Please try again.",
  //         explanation:
  //           "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  //         point: "10",
  //       },
  //       {
  //         question: "Which of the following concepts is/are key to ReactJS?",
  //         questionType: "text",
  //         answerSelectionType: "single",
  //         answers: [
  //           "Component-oriented design",
  //           "Event delegation model",
  //           "Both of the above",
  //         ],
  //         correctAnswer: "3",
  //         messageForCorrectAnswer: "Correct answer. Good job.",
  //         messageForIncorrectAnswer: "Incorrect answer. Please try again.",
  //         explanation:
  //           "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  //         point: "30",
  //       },
  //       {
  //         question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit,",
  //         questionType: "photo",
  //         answerSelectionType: "single",
  //         answers: [
  //           "https://dummyimage.com/600x400/000/fff&text=A",
  //           "https://dummyimage.com/600x400/000/fff&text=B",
  //           "https://dummyimage.com/600x400/000/fff&text=C",
  //           "https://dummyimage.com/600x400/000/fff&text=D",
  //         ],
  //         correctAnswer: "1",
  //         messageForCorrectAnswer: "Correct answer. Good job.",
  //         messageForIncorrectAnswer: "Incorrect answer. Please try again.",
  //         explanation:
  //           "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  //         point: "20",
  //       },
  //       {
  //         question: "What are the advantages of React JS?",
  //         questionType: "text",
  //         answerSelectionType: "multiple",
  //         answers: [
  //           "React can be used on client and as well as server side too",
  //           "Using React increases readability and makes maintainability easier. Component, Data patterns improves readability and thus makes it easier for manitaining larger apps",
  //           "React components have lifecycle events that fall into State/Property Updates",
  //           "React can be used with any other framework (Backbone.js, Angular.js) as it is only a view layer",
  //         ],
  //         correctAnswer: [1, 2, 4],
  //         messageForCorrectAnswer: "Correct answer. Good job.",
  //         messageForIncorrectAnswer: "Incorrect answer. Please try again.",
  //         explanation:
  //           "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  //         point: "20",
  //       },
  //     ],
  //   }
  const {
    quizTitle,
    quizSynopsis,
    progressBarColor,
    nrOfQuestions,
    questions,
    parentId,
  } = await request.json();

  if (!quizTitle || !quizSynopsis || !nrOfQuestions || !questions) {
    return NextResponse.json(
      { success: false, error: "All fields are required" },
      { status: 400 }
    );
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }

  const userId = token.sub;

  const userDatabase = dbClient.db("userData");
  const userData = userDatabase.collection("users");
  const user = await userData.findOne({ id: userId });
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: "User not found",
      },
      { status: 404 }
    );
  }

  const database = dbClient.db("quizzesData");
  const quizzes = database.collection("quizzes");

  const lessonDB = dbClient.db("lessonsData");
  const lessons = lessonDB.collection("lessons");

  let parentLesson = null;
  if (parentId) {
    parentLesson = await lessons.findOne({ id: parentId });
    if (!parentLesson) {
      return NextResponse.json({
        success: false,
        error: "Parent lesson not found",
      });
    }
    const parentHeight = parentLesson.treeHeight || 1;
    if (parentHeight >= 5) {
      // Quiz Height is 1 greater than the default lesson Height
      return NextResponse.json({
        success: false,
        error: "Maximum tree height exceeded",
      });
    }
  }

  const quiz = {
    id: uuidv4() as string,
    title: quizTitle,
    description: quizSynopsis,
    progressBarColor,
    nrOfQuestions: parseInt(nrOfQuestions),
    questions,
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
    // children: [], You can't have children for quizzes lol.
  };

  await quizzes.insertOne(quiz);

  if (parentLesson) {
    await lessons.updateOne(
      { id: parentId },
      {
        // @ts-ignore
        $push: {
          children: {
            type: "quiz",
            id: quiz.id,
          },
        },
      }
    );
  }

  return NextResponse.json(
    {
      success: true,
      quizId: quiz.id,
    },
    { status: 201 }
  );
}
