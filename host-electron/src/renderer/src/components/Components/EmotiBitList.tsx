import { Card, CardHeader, CardBody, CardFooter, Divider } from "@heroui/react";
import { ReactElement } from "react";

interface IEmotiBitList {
  icon: ReactElement;
  joiner?: string;
  serial: string;
    ip: string;
}

export default function EmotiBitList(
  props: IEmotiBitList
) {
  return (
    <Card className="border shadow-lg rounded-lg max-w-[400px] bg-white">
      <CardHeader className="flex flex-col items-start gap-2 p-4 ">

          <div className="text-lg">{props.icon}</div>
          <h1 className="ml-2 text-sm font-medium">Joiner:{props.joiner}</h1>
        <h1 className="text-lg font-bold"> {props.serial} </h1>
      </CardHeader>
      <Divider />
      <CardBody className="p-4">
        <p className="text-md text-gray-600">{props.ip}</p>
          <div className="text-sm">{props.icon}</div>
      </CardBody>
    </Card>
  );
}
