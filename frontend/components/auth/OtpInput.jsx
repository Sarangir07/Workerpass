"use client";

import { useRef } from "react";

export default function OtpInput({ value, onChange }) {
  const inputsRef = useRef([]);
  const digits = value.padEnd(6, " ").slice(0, 6).split("");

  function updateDigit(index, nextValue) {
    const digit = nextValue.replace(/\D/g, "").slice(-1);
    const nextDigits = digits.map((item) => (item === " " ? "" : item));
    nextDigits[index] = digit;
    onChange(nextDigits.join("").slice(0, 6));

    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(event, index) {
    if (event.key === "Backspace" && !digits[index].trim() && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  return (
    <div className="grid grid-cols-6 gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          aria-label={`OTP digit ${index + 1}`}
          className="h-12 rounded-lg border border-slate-200 bg-white/85 text-center text-lg font-black text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/70 sm:h-14"
          inputMode="numeric"
          key={index}
          maxLength={1}
          ref={(node) => {
            inputsRef.current[index] = node;
          }}
          value={digit.trim()}
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        />
      ))}
    </div>
  );
}
