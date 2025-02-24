import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import { ReactElement } from "react";
import { HiAcademicCap } from "react-icons/hi";
import { ILab } from "../../Views/HostSelectLabPage";

interface ICardComponent{
  headingTitle: string;
  icon: ReactElement;
  description: string;
  handler: () => void;
  value: ILab;
  selectedLab: ILab | undefined;
}

export default function CardComponent(props: ICardComponent){


    return(
        <label className="bg-white-100 flex flex-col items-center max-w-[500px] text-black rounded-xl px-4 py-2 border has-[:checked]:bg-purple-200 border-purple-800 h-[200px] hover:bg-neutral-200 transition-colors has-[:checked]:text-indigo-900 has-[:checked]:ring-indigo-200 .. ">
                  <input className="appearance-none" type="radio" onChange={() => props.handler()} checked={props.selectedLab?.id === props.value.id} value={props.value.id}/>
                  <div className="flex align-content-start gap-4 items-center">
                      {props.icon}
                      <p className="text-4xl leading-none text-center font-medium text-black"> {props.headingTitle}</p>
                  </div>
                  <div className="flex flex-col content-center h-full">
                    <p className="text-xl my-auto text-black">{props.description}</p>
                  </div>

        </label>
    )
}