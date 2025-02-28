
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';


// const determineFileExtension = () => { 
//     if (req.file.mimetype === "image/png")
//     {
//         detectedFileExtension = ".png";
//         console.log("PNG File Detected")
//     }
// }


export function determineFileExtension(file)
{
    let detectedFileExtension: string = "";

    if (file.mimetype === "image/png")
    {
        detectedFileExtension = ".png";
        console.log("PNG File Detected")
    }
    if (file.mimetype === "image/jpg")
    {
        detectedFileExtension = ".jpg";
        console.log("JPG File Detected")
    }
    if (file.mimetype === "image/jpeg")
    {
        detectedFileExtension = ".jpeg"
    }

    return detectedFileExtension;
}

export async function getNumberFilesInDirectory(directory: string): Promise<number>
{
    const directoryExists = fs.existsSync(directory);
    let numFiles = 0;

    if (!directoryExists)
    {
        console.log("Directory ", directory, " does not exist...");
        return 0;
    }
    else
    {
        const files = await fsPromises.readdir(directory);
        console.log(`Number of files in ${directory}: ${files.length}`);
        return files.length;
    }
}



