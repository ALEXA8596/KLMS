/// <reference types="react" />
import FlashcardArrayProps from "../../interfaces/IFlashcardArray";
import "./FlashcardArray.scss";
declare function FlashcardArray({ cards, controls, showCount, onCardChange, onCardFlip, frontCardStyle, frontContentStyle, backCardStyle, backContentStyle, forwardRef, FlashcardArrayStyle, currentCardFlipRef, cycle, }: FlashcardArrayProps): JSX.Element;
export default FlashcardArray;
