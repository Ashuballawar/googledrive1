const fs = require('fs');
const { google }= require('googleapis');
require('dotenv').config()
const path=require('path')
const apikeys = require('./apikey.json');
const SCOPE = ['https://www.googleapis.com/auth/drive'];
const { OAuth2Client } = require('google-auth-library');
const axios=require('axios')

const drive = google.drive({
    version: 'v3',
    auth: OAuth2Client,
  });
  // const drive = google.drive({ version: 'v3', auth: oauth2Client });
  
  //authorization
async function authorize(){
    const jwtClient = new google.auth.JWT(
        apikeys.client_email,
        null,
        apikeys.private_key,
        SCOPE
    );

    await jwtClient.authorize();

    return jwtClient;
}

  

 exports.getdata=async (req, res) => {
    try {
      
    //   const fileId =process.env.fileId
  
      
      const downloadPath = path.join(__dirname,`${new Date().getTime()}.mp4`);
  
      
     
  
 
      const response = fs.createWriteStream(downloadPath);

      const { data } = await drive.files.get(
        {
          fileId: process.env.fileId,
          alt: 'media',
        },
        { responseType: 'stream' }
      );
  
//  converting into writable stream
      data.pipe(response);
  
      
      response.on('finish', () => {
        console.log(`Video downloaded to ${downloadPath}`);
        res.status(200).send('Video downloaded successfully.');
      });
    
      const media = {
        mimeType: 'video/mp4', 
        body: fs.createReadStream(downloadPath),
      };

     //uploading into google drive to a specific folder
     
     const fileSize = fs.statSync(downloadPath).size;
  const chunkSize = 5 * 1024 * 1024; 
  const numberOfChunks = Math.ceil(fileSize / chunkSize);
  
  const res=await drive.files.create({
    media:media,
    resource: {
     name:"",
      parents: [process.env.FOLDER_ID],
    },
   fields:'id'
  });
  const fileId = res.data.id;
  let currentChunk = 0;
  let startByte = 0;
 
  while (currentChunk < numberOfChunks) {
    const endByte = Math.min(startByte + chunkSize, fileSize);
    const chunk = fs.createReadStream(downloadPath, { start: startByte, end: endByte - 1 });
    const range = `bytes ${startByte}-${endByte - 1}/${fileSize}`;
    try{
    await axios.put(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=resumable`, chunk, {
      headers: {
        'Content-Type': 'video/mp4', 
        'Content-Length': endByte - startByte,
        'Content-Range': range ,
     
      },
    });
  

      res.status(200).send('Video downloaded and uploaded successfully.');
      startByte = endByte;
      currentChunk++;
  }catch{

      response.on('error', (err) => {
        console.log('Error:', err);
        res.status(500).send('Error in uploading video.');
      });
    }}

    } catch (error) {

      console.log( error);
      res.status(500).send('Server Error');
    }
  };
  
  