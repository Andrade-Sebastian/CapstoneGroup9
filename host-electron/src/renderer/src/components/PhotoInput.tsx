import React from "react";

interface IPhotoInput {
  width: number;
  height: number;
  onFileSelected: (isFileSelected: boolean) => void;
  onSourceChange: (source: string | null) => void;
  imageSource: string | undefined;

}

export default function PhotoInput(props: IPhotoInput) {
  const inputRef = React.useRef<HTMLInputElement>(null); //access to file input when the host clicks choose image button
  const [source, setSource] = React.useState<string | null>(null); //URL of the file that is selected is stored here.
  const [error, setError] = React.useState<string | null>(null); //need this just in case user doesn't select an image or another error comes up

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; //retrieves the file by the host from the input's files array.
    //console.log('', file);
   // console.log("File name: " + file?.name);


    if (!file){
        setError("No file selected.");
        props.onFileSelected(false); //no file is selected. setting to false so that host cannot continue without selecting an image
        props.onSourceChange(null);
        return;
    }

    if (!file.type.startsWith("image/")) { //makes sure that the file is an image
      setError("Please upload a valid image file.");
      props.onFileSelected(false); //no file selected. set to false so host cannot continue without selecting an image
      props.onSourceChange(null);
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file); //a temp url is generated for the selected file which is stored in the source state for previewing the image
    setSource(url);
    props.onFileSelected(true); //file is selected, host can now continue
    props.onSourceChange(url);
  };
  const handleChoose = () => {
    inputRef.current?.click();
  };
  return (
    
    <div className="flex flex-col justify-center items-center border p-4 rounded-md shadow-md size-">
        {/* Insert image */}
      <input
        ref={inputRef}
        className="flex flex-col justify-center items-center border"
        type="file"
        onChange={handleFileChange}
        accept="image/jpg, image/jpeg, image/png" //restricts just these image files
      />

      {error && <p className="text-red-500 text-sm mt-2"> {error}</p>}
      {/* image Preview */}
      {props.imageSource && (
        <div className="mt-4">
          <img
            width={props.width}
            height={props.height}
            src={props.imageSource}
            alt="Selected"
            className="rounded-md shadow-md"
          />
        </div>
      )}
      <div className="mt-4 text-sm text-gray-600">
        {source ? "Image selected" : " Please select an image"} 
        {/* show url or if there isn't anything, then just show nothing selected text */}
      </div>
    </div>
  );
}
