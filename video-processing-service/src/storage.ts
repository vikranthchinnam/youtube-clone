// 1. GCS file interactions
// 2. Local file interaction
import { Storage } from "@google-cloud/storage";
import fs from 'fs';
import ffmpeg from "fluent-ffmpeg";
import { resolve } from "path";
import { rejects } from "assert";

const storage = new Storage();

const rawVideoBucketName = "vc-yt-raw-videos";
const processedVideoBucketName = "vc-yt-processed-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-vidoes";

/**
 * Creates the local directories for raw and processed videos.
 */
export function setupDirectories(){
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);
}

/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}
 * @returns A promise that resolves when the video is being converted.
 */
export function convertVideo(rawVideoName: string, processedVideoName: string){
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=-1:360") // 360p
        .on("end", () => {
            console.log("Processing finished successfully.");
            resolve();
        })
        .on("error", (err) => {
            console.log(`An error occurred: ${err}`);
            reject(err);
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`);
    });
    
}

/**
 * @param fileName - The name of the file to download from the 
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder
 * @returns a promise that resolves when the file has been downloaded
 */
export async function downloadRawVideo(fileName: string){
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({destination: `${localRawVideoPath}/${fileName}`});
    console.log(`gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`);
}

/**
 * @param fileName - The name of the file to upload from the 
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName} bucket
 * @returns a promise that resolves when the file has been uploaded
 */
export async function uploadProcessedVideo(fileName: string){
    const bucket = storage.bucket(processedVideoBucketName);
    await bucket.upload(`${localProcessedVideoPath}/${fileName}`,{
        destination: fileName
    });

    console.log(`${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}`);

    await bucket.file(fileName).makePublic();

}

/**
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */
function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if(!fs.existsSync(filePath)){
            reject(`File ${filePath} does not exist.`)
        }
        else{
            fs.unlink(filePath, (err) => {
                if(err){
                    console.log(`Failed to delete file at ${filePath}`, err);
                    reject(err);
                }
                else{
                    console.log(`File deleted at ${filePath}`);
                }
            })
        }
    })
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localRawVideoPath} folder.
 * @returns a promise that resolves when the file has been deleted
 */
export function deleteRawVideo(fileName: string){
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localProcessedVideoPath} folder.
 * @returns a promis that resolves when the file has been deleted.
 */
export function deleteProcessedVideo(fileName: string){
    return deleteFile(`${localProcessedVideoPath}/${fileName}`)
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check
 */
function ensureDirectoryExistence(dirPath : string){
    if(!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath, {recursive:true});
        console.log(`Directory created at ${dirPath}`);
    }
}