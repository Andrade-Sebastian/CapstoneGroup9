import React from "react";
import { IJoiner } from "../Views/SpectatorActiveExperiment.tsx";
import { ReactElement } from "react";

interface IJoiner {
  id: string;
  name: string;
}
interface IJoinerCardComponent {
  icon: ReactElement;
  joiner: IJoiner;
  isSelected: boolean;
  onSelect: () => void;
  fileName: string | null;
}

export default function JoinerCardComponent(props: IJoinerCardComponent) {
  return (
    <label
      className={`flex flex-col items-start h-full border-2 text-black rounded-xl px-4 py-2 shadow-md hover:bg-neutral-200 transition-colors cursor-pointer w-full ${
        props.isSelected
          ? "border-black bg-[#7F56D9] text-white"
          : "border-black bg-white text-black hover:bg-gray-200"
      }`}
      onClick={props.onSelect}
    >
      <div className="flex flex-row items-center justify-between w-full">
        <div className="flex align-content-start gap-4 items-center w-min px-4 py-1 rounded-lg ">
          {props.icon}
        </div>
        <div className="flex flex-col content-center h-full pr-10">
          <p className="font-bold text-lg"> Joiner</p>
          <p className={`text-md font-light ${props.isSelected ? "text-white" : "text-black"}`}>{props.joiner.name}</p>
          {props.isSelected && <p className="text-md font-light"> Selected</p>}
        </div>
        <div className="flex flex-col content-center h-full">
          <p className="font-bold text-lg">Viewing</p>
          <p className={`text-md font-light ${props.isSelected ? "text-white" : "text-black"}`}>
            {props.fileName || "No File"}
          </p>
        </div>
      </div>
    </label>
  );
}
