/// <reference types="react" />
import FlashcardProps from "../../interfaces/IFlashcard";
import "./Flashcard.scss";
declare function Flashcard({ frontHTML, frontCardStyle, frontContentStyle, backHTML, backCardStyle, backContentStyle, className, style, height, borderRadius, width, onCardFlip, manualFlipRef, }: FlashcardProps): JSX.Element;
export default Flashcard;
