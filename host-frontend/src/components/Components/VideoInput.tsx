import React from "react";

interface IVideoInput {
  width: number;
  height: number;
  onFileSelected: (isFileSelected: boolean) => void;
}

export default function VideoInput(props: IVideoInput) {
  const inputRef = React.useRef<HTMLInputElement>(null); //access to file input when the host clicks choose video button
  const [source, setSource] = React.useState<string | null>(null); //URL of the file that is selected is stored here.
  const [error, setError] = React.useState<string | null>(null); //need this just in case user doesn't select a video or another error comes up

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; //retrieves the file by the host from the input's files array.

    if (!file){
        setError("No file selected.");
        props.onFileSelected(false); //no file is selected. setting to false so that host cannot continue without selecting a video
        return;
    }

    if (!file.type.startsWith("video/")) { //makes sure that the file is a video
      setError("Please upload a valid video file.");
      props.onFileSelected(false); //no file selected. set to false so host cannot continue without selecting a video
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file); //a temp url is generated for the selected file which is stored in the source state for previewing the video
    setSource(url);
    props.onFileSelected(true); //file is selected, host can now continue
  };
  const handleChoose = () => {
    inputRef.current?.click();
  };
  return (
    <div className="flex flex-col justify-center items-center border p-4 rounded-md shadow-md">
        {/* Insert Video */}
      <input
        ref={inputRef}
        className="flex flex-col justify-center items-center border"
        type="file"
        onChange={handleFileChange}
        accept=".mov,.mp4" //restricts just these video files
      />

      {error && <p className="text-red-500 text-sm mt-2"> {error}</p>}
      {/* Video Preview */}
      {source && (
        <div className="mt-4">
          <video
            width={props.width}
            height={props.height}
            controls
            src={source}
            className="rounded-md shadow-md"
          />
        </div>
      )}
      <div className="mt-4 text-sm text-gray-600">
        {source ? "Video selected" : " Please select a video"} 
        {/* show url or if there isn't anything, then just show nothing selected text */}
      </div>
    </div>
  );
}
