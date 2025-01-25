import { Card, CardHeader, Image } from "@nextui-org/react";

interface IImageCardComponent {
  headingTitle: string;
  description: string;
  source: string;
  alt: string;
}
export default function ImageCardComponent(props: IImageCardComponent) {
  return (
    <Card className="py-4 border border-gray-300 flex flex-row items-start gap-4">
      <div className="flex flex-col flex-1 px-4">
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          {/* <div className="border border-gray-300"> */}
          <p className="text-tiny uppercase font-bold"> {props.headingTitle}</p>
          <small className="text-default-500">
            {props.description}
          </small>
        </CardHeader>
      </div>
      <Image
        alt={props.alt}
        className="object-cover rounded-xl mr-5"
        src={props.source}
        width={200}
      />
    </Card>
  );
}
