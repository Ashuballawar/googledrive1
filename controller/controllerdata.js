const fs = require('fs');
const { google }= require('googleapis');
require('dotenv').config()
const path=require('path')
const apikeys = require('./apikey.json');
const SCOPE = ['https://www.googleapis.com/auth/drive'];
const { OAuth2Client } = require('google-auth-library');


const drive = google.drive({
    version: 'v3',
    auth: OAuth2Client,
  });

  
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
      
      const fileId =process.env.fileId
  
      
      const downloadPath = path.join(__dirname,'video.mp4');
  
      
     // const fileMetadata = await drive.files.get({ fileId, fields: 'video/*'});
  
 
      const response = fs.createWriteStream(downloadPath);

      const { data } = await drive.files.get(
        {
          fileId: process.env.fileId,
          alt: 'media',
        },
        { responseType: 'stream' }
      );
  
 //converting into writable string
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
      await drive.files.create({
        media:media,
        resource: {
         
          parents: [process.env.FOLDER_ID],
        },
       
      });

      res.status(200).send('Video downloaded and uploaded successfully.');
    
      

      response.on('error', (err) => {
        console.log('Error:', err);
        res.status(500).send('Error downloading video.');
      });
    } catch (error) {

      console.log( error);
      res.status(500).send('Server Error');
    }
  };
  
  