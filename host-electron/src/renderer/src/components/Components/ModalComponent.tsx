import { ReactElement } from "react";

interface IModalComponent {
  onAction: () => void;
  isOpen: boolean;
  onCancel: () => void;
  modalTitle: string;
  button: string;
  children: ReactElement | Array<ReactElement>;
}
function onCancel(){

}
export default function ModalComponent(props: IModalComponent) {
  const handleModalClick = (e: React.MouseEvent) => e.stopPropagation();
  if(!props.isOpen) return null; //if modal is closed, don't open
  return (
    //w-lvw h-svh
    <div className="flex z-[1000] fixed inset-0 bg-black/50" 
         onClick={props.onCancel} //so if you click outside of the modal, it closes
    >
      <div className="flex flex-col bg-white w-[400px] p-6 gap-4 mx-auto my-auto border drop-shadow rounded-md "
           onClick={handleModalClick} //doesn't close when you click inside of the modal
      >
        <div>
          <p className="text-large font-medium">{props.modalTitle}</p>
        </div>
        <div>{props.children}</div>
        <div className="flex flex-col">
          <button
            type="button"
            className="mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out bg-[#7F56D9] hover:bg-violet-500 text-white"
            onClick={props.onAction}
          >
            {props.button}
          </button>
          <button
            type="button"
            className="mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out border bg-white hover:bg-gray-100 text-black"
            onClick={props.onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
