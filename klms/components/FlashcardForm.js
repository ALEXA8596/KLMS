import React, { useState } from "react";

function FlashcardForm({ onSubmit, submitting }) {
  const [flashcardTitle, setFlashcardTitle] = useState("");
  const [flashcardDescription, setFlashcardDescription] = useState("");
  const [cards, setCards] = useState([
    {
      front: "",
      back: "",
      hint: "",
      difficulty: "medium",
    },
  ]);

  const handleAddCard = () => {
    setCards([
      ...cards,
      {
        front: "",
        back: "",
        hint: "",
        difficulty: "medium",
      },
    ]);
  };

  const handleRemoveCard = (index) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleCardChange = (index, field, value) => {
    setCards(
      cards.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ flashcardTitle, flashcardDescription, cards });
  };

  return (
    <div className="FlashcardForm container mt-4">
      <form name="flashcard-form" onSubmit={handleSubmit}>
        <div
          className="p-4 mb-4"
          style={{
            background: "#e8f5e8",
            borderRadius: "16px",
          }}
        >
          <div className="mb-3">
            <label className="form-label">Flashcard Set Title</label>
            <input
              type="text"
              className="form-control"
              value={flashcardTitle}
              onChange={(e) => setFlashcardTitle(e.target.value)}
              placeholder="Flashcard Set Title"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={flashcardDescription}
              onChange={(e) => setFlashcardDescription(e.target.value)}
              placeholder="Description of the flashcard set"
            />
          </div>
        </div>
        <div
          className="p-4 mb-4"
          style={{
            background: "#e8f5e8",
            borderRadius: "16px",
          }}
        >
          <ul className="list-group mb-3">
            {cards.map((card, cIndex) => (
              <li key={cIndex} className="list-group-item mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="mb-0">Card #{cIndex + 1}</h4>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    title="Remove Card"
                    onClick={() => handleRemoveCard(cIndex)}
                    disabled={cards.length === 1}
                  >
                    Remove Card
                  </button>
                </div>
                <div className="mb-3">
                  <label className="form-label">Front (Question/Term)</label>
                  <textarea
                    className="form-control"
                    value={card.front}
                    onChange={(e) =>
                      handleCardChange(cIndex, "front", e.target.value)
                    }
                    placeholder="What appears on the front of the card"
                    rows="3"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Back (Answer/Definition)</label>
                  <textarea
                    className="form-control"
                    value={card.back}
                    onChange={(e) =>
                      handleCardChange(cIndex, "back", e.target.value)
                    }
                    placeholder="What appears on the back of the card"
                    rows="3"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Hint (Optional)</label>
                  <textarea
                    className="form-control"
                    value={card.hint}
                    onChange={(e) =>
                      handleCardChange(cIndex, "hint", e.target.value)
                    }
                    placeholder="Optional hint to help remember"
                    rows="2"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Difficulty Level</label>
                  <select
                    className="form-select"
                    value={card.difficulty}
                    onChange={(e) =>
                      handleCardChange(cIndex, "difficulty", e.target.value)
                    }
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          className="btn btn-success mb-3"
          onClick={handleAddCard}
        >
          Add Card
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

export default FlashcardForm;
