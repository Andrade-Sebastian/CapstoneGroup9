import React from 'react';
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

    const handleImageClick = (image) => {
        setSelectedGalleryImage(image);
        const filename = image.src.split("/").pop();
        console.log("IN GALLERYCOMPONENT, here is the filename in the payload",filename);
        const payload = {
            filename,
            caption: image.caption,
        };
        socket.emit("image-selected", payload);
    };

    return(
        <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
            {props.images.map((image, index) => (
                <div key={index} className='bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer' onClick={() => handleImageClick(image)}>
                    <img src={image.src} alt={`Gallery${index}`} className='w-full h-48 object-cover'/>
                    <div className='p-3'>
                            <p className='text-sm text-gray-700 font-medium'> {image.caption}</p>
                        </div>
                    </div>
            ))}
        </div>
    );
};

