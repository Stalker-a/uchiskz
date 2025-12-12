import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

interface MathTextProps {
  text: string;
  block?: boolean; // Если true, формула будет по центру с новой строки
}

export default function MathText({ text, block = false }: MathTextProps) {
  // Если в тексте нет знака $, просто возвращаем текст
  if (!text.includes("$")) {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }

  // Разбиваем текст по знаку $. 
  // Пример: "Найти $x$, если..." -> ["Найти ", "x", ", если..."]
  const parts = text.split("$");

  return (
    <span>
      {parts.map((part, index) => {
        // Каждый нечетный элемент (1, 3, 5...) - это формула внутри $...$
        if (index % 2 === 1) {
          return block ? (
            <BlockMath key={index} math={part} />
          ) : (
            <InlineMath key={index} math={part} />
          );
        }
        // Четные элементы - просто текст
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}