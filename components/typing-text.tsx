"use client";

import { useEffect, useState } from "react";

const words = ["Community", "Saves", "Events", "Calendar", "Posts", "Vendors", "Guests", "Invites", "Local"];

export function TypingText() {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;

    const currentWord = words[wordIndex];
    const isLastWord = wordIndex === words.length - 1;

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setText(currentWord.substring(0, text.length - 1));
        if (text.length === 1) {
          setIsDeleting(false);
          setWordIndex((prev) => prev + 1);
        }
      } else {
        setText(currentWord.substring(0, text.length + 1));
        if (text.length === currentWord.length) {
          if (isLastWord) {
            setDone(true);
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
          return;
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, done]);

  return <span>{text}</span>;
}
