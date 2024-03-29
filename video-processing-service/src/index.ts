import express  from "express";
import ffmpeg from "fluent-ffmpeg";
import { convertVideo, deleteProcessedVideo, deleteRawVideo, downloadRawVideo, setupDirectories, uploadProcessedVideo } from "./storage";

setupDirectories();

const app = express();
app.use(express.json());

app.post("/process-video", async (req, res) => {
    // Get the bucket and fileName fromt the cloud pub/sub message queue
    let data;
    try{
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf-8');
        data = JSON.parse(message);
        if(!data.name){
            throw new Error('Invalid message payload recieved');
        }
    }
    catch(error){
        console.log(error);
        return res.status(400).send("Bad Request : missing filename.");
    }
    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;

    // Download the raw video from Cloud Storage
    await downloadRawVideo(inputFileName);

    try {
        await convertVideo(inputFileName, outputFileName);
    }
    catch(err){
        await Promise.all([
            deleteRawVideo(inputFileName),
            deleteProcessedVideo(outputFileName)
        ]) 
        
        console.log(err);
        return res.status(500).send("Internal Server Error: Video Processing Failed ")
    }
    // Upload the processed video to cloud storage
    await uploadProcessedVideo(outputFileName);

    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName)
    ]) 

    return res.status(200).send('Processing finished successfully');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Video processing service listening at http://localhost:${port}`);
});