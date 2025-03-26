import React from 'react';
interface IGalleryViewer{
    imageSrc: string; 
    caption: string;
    index: number;
}

export default function GalleryViewer (props: IGalleryViewer) {
    return(
        <div className="flex flex-col items-center justify-center w-full h-full p-4">
            <div className='max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-hidden'>
                <div className='p-1 bg-gray-100 text-start'>
                    <p className='text-gray-800 text-md font-medium'> {props.index}</p>
                </div>
                <img src={props.imageSrc} alt={props.caption} className='w-full h-auto object-contain'/>
                <div className='p-4 bg-gray-100 text-center'>
                    <p className='text-gray-800 text-md font-medium'> {props.caption}</p>
                </div>
            </div>

        </div>
    );
}