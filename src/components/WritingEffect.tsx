import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';

interface WritingEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const WritingEffect: React.FC<WritingEffectProps> = ({ text, speed = 30, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setIsComplete(false);
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(timer);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return (
    <div className="markdown-body">
      <Markdown>{displayedText}</Markdown>
    </div>
  );
};
