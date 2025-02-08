import { Card, CardHeader, CardBody, CardFooter, Divider } from "@heroui/react";
import { ReactElement } from "react";

interface IWaitingRoomCardComponent {
  icon: ReactElement;
  labType: string;
  labTitle: string;
  description: string;
}

export default function WaitingRoomCardComponent(
  props: IWaitingRoomCardComponent
) {
  return (
    <Card className="border shadow-lg rounded-lg max-w-[400px] bg-white">
      <CardHeader className="flex flex-col items-start gap-2 p-4 ">
        <div className="flex items-center px-3 py-1 rounded-full bg-[#894DD6] text-white">
          <div className="text-sm">{props.icon}</div>
          <p className="ml-2 text-sm font-medium">{props.labType}</p>
        </div>
        <h1 className="text-lg font-bold"> {props.labTitle}</h1>
      </CardHeader>
      <Divider />
      <CardBody className="p-4">
        <p className="text-md text-gray-600">{props.description}</p>
      </CardBody>
    </Card>
  );
}
