import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import { ReactElement } from "react";
import { HiAcademicCap } from "react-icons/hi";
interface ICardComponent{
  headingTitle: string;
  icon: ReactElement;
  description: string;
}


export default function CardComponent(props: ICardComponent){
    return(
        <div className="flex flex-col items-center bg-white max-w-[500px] text-black rounded-xl px-4 py-2 border border-gray-300 shadow-xl h-[200px] hover:bg-neutral-200 transition-colors ">
                  <div className="flex align-content-start gap-4 items-center">
                      {props.icon}
                      <p className="text-4xl leading-none text-center font-medium text-black"> {props.headingTitle}</p>
                  </div>
                  <div className="flex flex-col content-center h-full">
                    <p className="text-xl my-auto text-black">{props.description}</p>
                  </div>

        </div>
    )
}