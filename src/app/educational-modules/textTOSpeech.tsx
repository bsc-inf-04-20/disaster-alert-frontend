
 const text = document.body.innerText;
  const utterance = new SpeechSynthesisUtterance(text);

export const TextToSpeech = (text: string): void => {
  if (!('speechSynthesis' in window)) {
    alert("Sorry, your browser doesn't support text-to-speech.");
    return;
  }

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
};

export const pauseSpeech = (): void => {
  if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
    window.speechSynthesis.pause();
  }
};

export const resumeSpeech = (): void => {
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
};

export const stopSpeech = (): void => {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
};

