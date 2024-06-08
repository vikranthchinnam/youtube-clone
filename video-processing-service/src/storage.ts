// 1. GCS file interactions
// 2. Local file interactions

import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const storage = new Storage();

const rawVideoBucketName = "";
const processedVideoBucketName = "";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";
/** 
 * Creates the local directories for raw and processed videos.
*/
export function setupDirectories(){
    ensureDirectoryExistence(localProcessedVideoPath);
    ensureDirectoryExistence(localRawVideoPath);
}

/** 
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param processedVideoName - the name of the file to convert to  {@link localProcessedVideoPath}
 * @returns A promise that resolves when the video has been converted.
*/
export function convertVideo(rawVideoName:string, processedVideoName: string){
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=-1:360") // 360p
        .on("end", () => {
            console.log("Processing finsihed succesfully.");
            resolve();
        })
        .on("error", (err) => {
            console.log(`An error occurred: ${err.message}`);
            reject(err);
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`)
    });
}

/**
 * @param fileName - the name of the file to download from the
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string) {
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({destination: `${localProcessedVideoPath}/${fileName}`});
    console.log(
        `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.`
    );
}

/**
 * @param fileName - the name of the file to upload from the
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName} bucket.
 * @returns a promise that resolves when the file is uploaded.
 */
export async function uploadProcessedVideo(fileName:string) {
    const bucket = storage.bucket(processedVideoBucketName);

    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName
    });

    console.log(
        `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}`
    );

    await bucket.file(fileName).makePublic();

}

/**
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */
function deleteFile(filePath: string): Promise<void>{
    return new Promise((resolve, reject) => {
        if(fs.existsSync(filePath)){
            fs.unlink(filePath, (err) => {
                if(err){
                    console.log(`Failed to delete file at ${filePath}`, err);
                    reject(err);
                }
                else{
                    console.log(`File deleted at ${filePath}`);
                    resolve();
                }
            });
        }
        else{
            console.log(`File not found at ${filePath}, skipping the delete.`);
            resolve();
        }
    });
}

/**
 * 
 * @param fileName  the name of the file to delete from the 
 * {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 * 
 */
export function deleteRawVideo(fileName: string){
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
 * 
 * @param fileName  the name of the file to delete from the 
 * {@link localProcessedVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 * 
 */
export function deleteProcessedVideo(fileName: string) {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

function ensureDirectoryExistence(dirPath: string){
    if(!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath, { recursive: true}); // recursive: true enables creating nested directories
        console.log(`Directory created at ${dirPath}`);
    }
}