import React, {useState} from 'react';
import { useSessionStore } from '../store/useSessionStore.tsx'
import socket from '../Views/socket.tsx'

interface IGalleryImage{
    src:string;
    caption: string;
}

interface IGalleryArray{
    images: IGalleryImage[];
}

export default function GalleryComponent(props: IGalleryArray){
    const setSelectedGalleryImage = useSessionStore((state) => state.setSelectedGalleryImage);
    const [selectedIndex, setSelectedIndex] = useState<number | null> (null);

    const handleImageClick = (image, index) => {
        setSelectedGalleryImage(image);
        setSelectedIndex(index);
        const filename = image.src.split("/").pop();
        console.log("IN GALLERYCOMPONENT, here is the filename in the payload",filename);
        const payload = {
            id: index,
            filename,
            caption: image.caption,
            src: image.src
        };
        console.log("Here is the payload that is being sent to main", payload)
        socket.emit("image-selected", payload);
    };

    return(
        <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
            {props.images.map((image, index) => (
                <div key={index} className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer ${selectedIndex === index ? 'ring-4 ring-purple-500' : 'hover:shadow-lg'}`} onClick={() => handleImageClick(image, index)}>
                    <div className='p-5'>
                        <p className='text-sm text-gray-700 font-large'> {index}</p>
                        </div>
                    <img src={image.src} alt={`Gallery${index}`} className='w-full h-48 object-cover'/>
                    <div className='p-3'>
                            <p className='text-sm text-gray-700 font-medium'> {image.caption}</p>
                        </div>
                    </div>
            ))}
        </div>
    );
};

