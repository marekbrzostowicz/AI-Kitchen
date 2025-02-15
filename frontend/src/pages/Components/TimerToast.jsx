import { useEffect, useState } from "react";

function TimerToast({ initialTime, onClose, type }) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          if (onClose) onClose();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  let message = "";
  if (type === "image") {
    message = (
      <>
        Next image generation in
        <br />
        {hours}h {minutes}m {seconds}s
      </>
    );
  } else if (type === "ingredient") {
    message = (
      <>
        Next ingredient info generation in:
        <br />
        {hours}h {minutes}m {seconds}s
      </>
    );
  } else if (type === "recipe") {
    message = (
      <>
        Next recipe generation in:
        <br />
        {hours}h {minutes}m {seconds}s
      </>
    );
  }

  return <div>{message}</div>;
}

export default TimerToast;
