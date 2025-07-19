import React, { useState } from "react";

function QuizForm({ onSubmit, submitting }) {
  const [quizTitle, setQuizTitle] = useState("");
  const [quizSynopsis, setQuizSynopsis] = useState("");
  const [questions, setQuestions] = useState([
    {
      question: "",
      questionType: "text",
      answers: [""],
      correctAnswer: "",
      messageForCorrectAnswer: "",
      messageForIncorrectAnswer: "",
      explanation: "",
      point: 0,
    },
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        questionType: "text",
        answers: [""],
        correctAnswer: "",
        messageForCorrectAnswer: "",
        messageForIncorrectAnswer: "",
        explanation: "",
        point: 0,
      },
    ]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    setQuestions(
      questions.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const handleAnswerChange = (qIndex, aIndex, value) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              answers: q.answers.map((a, j) => (j === aIndex ? value : a)),
            }
          : q
      )
    );
  };

  const handleAddAnswer = (qIndex) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIndex ? { ...q, answers: [...q.answers, ""] } : q
      )
    );
  };

  const handleRemoveAnswer = (qIndex, aIndex) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIndex
          ? { ...q, answers: q.answers.filter((_, j) => j !== aIndex) }
          : q
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ quizTitle, quizSynopsis, questions });
  };

  return (
    <div className="QuizForm container mt-4">
      <form name="quiz-form" onSubmit={handleSubmit}>
        <div
          className="p-4 mb-4"
          style={{
            background: "#e3f2fd",
            borderRadius: "16px",
          }}
        >
          <div className="mb-3">
            <label className="form-label">Quiz Title</label>
            <input
              type="text"
              className="form-control"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="Quiz Title"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Quiz Synopsis</label>
            <textarea
              className="form-control"
              value={quizSynopsis}
              onChange={(e) => setQuizSynopsis(e.target.value)}
              placeholder="Quiz Synopsis"
            />
          </div>
        </div>
        <div
          className="p-4 mb-4"
          style={{
            background: "#e3f2fd",
            borderRadius: "16px",
          }}
        >
          <ul className="list-group mb-3">
            {questions.map((question, qIndex) => (
              <li key={qIndex} className="list-group-item mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="mb-0">Question #{qIndex + 1}</h4>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    title="Remove Question"
                    onClick={() => handleRemoveQuestion(qIndex)}
                    disabled={questions.length === 1}
                  >
                    Remove Question
                  </button>
                </div>
                <div className="mb-3">
                  <label className="form-label">Question Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={question.question}
                    onChange={(e) =>
                      handleQuestionChange(qIndex, "question", e.target.value)
                    }
                    placeholder="Question Title"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Question Type</label>
                  <select
                    className="form-select"
                    value={question.questionType}
                    onChange={(e) =>
                      handleQuestionChange(
                        qIndex,
                        "questionType",
                        e.target.value
                      )
                    }
                  >
                    <option value="">Please select a question type</option>
                    <option value="text">Text</option>
                    <option value="photo">Photo</option>
                  </select>
                </div>
                <ul className="list-group mb-3">
                  {question.answers.map((answer, aIndex) => (
                    <li
                      key={aIndex}
                      className="list-group-item d-flex align-items-center"
                    >
                      <input
                        type="text"
                        className="form-control me-2"
                        value={answer}
                        onChange={(e) =>
                          handleAnswerChange(qIndex, aIndex, e.target.value)
                        }
                        placeholder={`Answer #${aIndex + 1}`}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        title="Remove Answer"
                        onClick={() => handleRemoveAnswer(qIndex, aIndex)}
                        disabled={question.answers.length === 1}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                  <li className="list-group-item">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleAddAnswer(qIndex)}
                    >
                      Add Answer
                    </button>
                  </li>
                  <li className="list-group-item">
                    <label className="form-label">Correct Answer</label>
                    <select
                      className="form-select"
                      value={question.correctAnswer}
                      onChange={(e) =>
                        handleQuestionChange(
                          qIndex,
                          "correctAnswer",
                          e.target.value
                        )
                      }
                      required
                    >
                      <option value="">Please select correct answer</option>
                      {question.answers.map((_, idx) => (
                        <option key={idx + 1} value={idx + 1}>{`Answer #${
                          idx + 1
                        }`}</option>
                      ))}
                    </select>
                  </li>
                </ul>
                <div className="mb-3">
                  <label className="form-label">
                    Message for Correct Answer
                  </label>
                  <textarea
                    className="form-control"
                    value={question.messageForCorrectAnswer}
                    onChange={(e) =>
                      handleQuestionChange(
                        qIndex,
                        "messageForCorrectAnswer",
                        e.target.value
                      )
                    }
                    placeholder="Message for Correct Answer"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Message for Incorrect Answer
                  </label>
                  <textarea
                    className="form-control"
                    value={question.messageForIncorrectAnswer}
                    onChange={(e) =>
                      handleQuestionChange(
                        qIndex,
                        "messageForIncorrectAnswer",
                        e.target.value
                      )
                    }
                    placeholder="Message for Incorrect Answer"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Explanation</label>
                  <textarea
                    className="form-control"
                    value={question.explanation}
                    onChange={(e) =>
                      handleQuestionChange(
                        qIndex,
                        "explanation",
                        e.target.value
                      )
                    }
                    placeholder="Explanation"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Point</label>
                  <input
                    type="number"
                    className="form-control"
                    value={question.point}
                    onChange={(e) =>
                      handleQuestionChange(qIndex, "point", e.target.value)
                    }
                    placeholder="Point"
                    min={0}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          className="btn btn-success mb-3"
          onClick={handleAddQuestion}
        >
          Add Question
        </button>
        <div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default QuizForm;
