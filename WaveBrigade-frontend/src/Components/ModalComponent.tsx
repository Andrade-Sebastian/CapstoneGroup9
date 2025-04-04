import { ReactElement } from "react";
import axios from "axios";


interface IModalComponent {
  onAction: (e: any) => void;
  onAction2?: () => void;
  onAction3?: () => void;
  isOpen: boolean;
  onCancel: () => void;
  modalTitle: string;
  button: string;
  button2?: string;
  button3?: string;
  children: ReactElement | Array<ReactElement>;
  isButtonDisabled?: boolean;
  isButton1Disabled?: boolean;
}

interface photoLabData {
  experimentTitle: string;
  experimentsDesc: string;
  imageSource: string;
  caption: string;
}



export default function ModalComponent(props: IModalComponent, photoLabData: photoLabData) {
  const handleModalClick = (e: React.MouseEvent) => e.stopPropagation();

  if(!props.isOpen) return null; //if modal is closed, don't open
  return (
    //w-lvw h-svh
    <div className="fixed inset-0 flex z-[1000] items-center  justify-center bg-black/50" 
        //  onClick={props.onCancel} //so if you click outside of the modal, it closes
    >
      <div className="flex flex-col bg-white w-[400px] max-h-[90vh]  overflow-y-auto p-6 gap-4 mx-auto my-auto border drop-shadow rounded-md "
           onClick={handleModalClick} //doesn't close when you click inside of the modal
      >
        <div>
          <p className="text-large font-medium">{props.modalTitle}</p>
        </div>
        <div>{props.children}</div>
        <div className="flex flex-col">
          {props.button && (
            <button
              type="button"
              className="mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out bg-[#7F56D9] hover:bg-violet-500 text-white disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer" 
              onClick={props.onAction}
              disabled={props.isButton1Disabled}
            >
            {props.button}
          </button>

          )}
          {props.button2 && (

          <button
            type="button"
            className="mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out bg-[#7F56D9] hover:bg-violet-500 text-white disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
            onClick={props.onAction2}
            disabled={props.isButtonDisabled}
          >
            {props.button2}
          </button>
          )}
          {props.button3 && (

          <button
            type="button"
            className="mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out bg-[#7F56D9] hover:bg-violet-500 text-white"
            onClick={props.onAction3}
          >
            {props.button3}
          </button>
          )}
          <button
            type="button"
            className="mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out border bg-white hover:bg-gray-100 text-black cursor-pointer"
            onClick={props.onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
