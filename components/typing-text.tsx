"use client";

import { useEffect, useState } from "react";

const words = ["Community", "Saves", "Events", "Calendar", "Posts"];

export function TypingText() {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    const timeout = setTimeout(
      () => {
        if (isDeleting) {
          setText(currentWord.substring(0, text.length - 1));

          if (text.length === 1) {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
          }
        } else {
          setText(currentWord.substring(0, text.length + 1));

          if (text.length === currentWord.length) {
            setTimeout(() => setIsDeleting(true), 2000);
            return;
          }
        }
      },
      isDeleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex]);

  return <span className="inline-block min-w-[90px] font-semibold">{text}</span>;
}
