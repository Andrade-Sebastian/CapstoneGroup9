import { ReactElement } from "react";

interface IModalComponent {
  onAction: () => void;
  isOpen: boolean;
  onCancel: () => void;
  modalTitle: string;
  children: ReactElement | Array<ReactElement>;
}
export default function ModalComponent(props: IModalComponent) {
  return (
    <div className="flex z-[1000] fixed w-lvw h-svh bg-black/50">
      <div className="flex flex-col bg-white w-[400px] p-6 gap-4 mx-auto my-auto border drop-shadow rounded-md ">
        <div>
          <p className="text-large font-medium">{props.modalTitle}</p>
        </div>
        <div>{props.children}</div>
        <div>
          <button onClick={() => {props.onCancel()}}> Close </button>
          <button onClick ={() => {props.onAction()}}> Action </button>
        </div>
      </div>
    </div>
  );
}
