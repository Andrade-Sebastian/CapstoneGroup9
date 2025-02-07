import { IoCloseCircle } from "react-icons/io5";
import React, { useRef, useState, ReactElement } from "react";


interface IGalleryInput {
    onFileSelected: (isFileSelected: boolean) => void;
    onSourceChange: (source: string | null) => void;
  }

export default function GalleryInput(props: IGalleryInput) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [source, setSource] = useState<string | null>(null);
    const [ error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if(!file) {
            setError("No file selected.");
            props.onFileSelected(false);
            props.onSourceChange(null);
            return;
        }
        if(!file.type.startsWith("image/")){
            setError("Please upload a valid image file.");
            props.onFileSelected(false);
            props.onSourceChange(null);
            return;
        }
        
        setError(null);
        const url = URL.createObjectURL(file);
        setSource(url);
        props.onFileSelected(true);
        props.onSourceChange(url);
    };
    const handleRemoveImage = () => {
        setSource(null);
        props.onFileSelected(false);
        props.onSourceChange(null);
    };
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md w-full max-w-[300px]">
        <label className="block text-md font-medium text-gray-700 mb-2">
          Add a Picture
          <span className="text-purple-500"> *</span>
        </label>
        <div className="relative w-full h-[200px] bg-gray-300 rounded-md flex items-center justify-center">
            {source ? (
                <img src={source} alt="Uploaded" className="w-full h-full object-cover rounded-md"/>
            ):(
                <p className="text-gray-500"> Preview</p>
            )}
            {source && (
                <button className="absolute top-2 right-2 bg-white rounded-full p-1 text-red-500 hover:text-red-700"
                onClick={handleRemoveImage}>
                    <IoCloseCircle size={20}/>
                </button>
            )}
        </div>
        {error && <p className="text-red-500 text-sm mt-2"> {error}</p>}
        <input 
            ref = {inputRef}
            type = "file"
            className="hidden"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileChange}
        />
        <button
            type="button"
            className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md w-full"
            onClick={() => inputRef.current?.click()}
            >
                Add Photo
            </button>
      </div>
  );
}
