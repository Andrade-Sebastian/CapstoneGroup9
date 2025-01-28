import { Image } from "@nextui-org/react";
import { ReactElement } from "react";

interface ISideComponent {
    headingTitle: string;
    description: string;
    icon: ReactElement;
  }

export default function SideComponent(props: ISideComponent){
    return(
        <div className="flex flex-col items-center text-center">
            <div className="flex justify-center items-center mb-2">
            <div className="object-cover rounded-xl">
            {props.icon}
            </div>
            </div>
            <h1 className="text-[#942BBA] text-[36px] uppercase font-bold"> {props.headingTitle}</h1>
            <p className="text-[20px] font-light max-w-[300px]">{props.description}</p>
        </div>
    );
}