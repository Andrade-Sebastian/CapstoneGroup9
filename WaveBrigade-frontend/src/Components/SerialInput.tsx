import React, { useState, useRef } from "react";

interface SerialCodeInputProps {
  length: number; 
  onComplete: (code: string) => void; 
  onChange?: (code: string) => void;
}

const SerialCodeInput: React.FC<SerialCodeInputProps> = ({
  length,
  onComplete,
  onChange,

}) => {
  const [values, setValues] = useState<string[]> (Array(length).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; //this code only allows numbers, so user wont be able to input letters or symbols
    const updatedValues = [...values];
    updatedValues[index] = value;
    setValues(updatedValues);

    //this code makes it so you move on to the next field if a number is inputted
    if(value && index <length - 1){
      inputsRef.current[index +1]?.focus();
    }

    if (onChange){
        onChange(updatedValues.join(""));
    }
    //when the four numbers are filled, call onComplete callback
    if (updatedValues.join("").length === length){
      onComplete(updatedValues.join(""));
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && values[index] === ""){
      if(index > 0){
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  return (
    <div className="flex gap-2">
      {Array(length)
        .fill(null)
        .map((_, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            value={values[index]}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => (inputsRef.current[index] = el)}
            className="w-20 h-20 border border-gray-300 rounded text-center text-[25px] focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        ))}
    </div>
  );
};
export default SerialCodeInput;
