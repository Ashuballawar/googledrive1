const fs = require('fs');
const { google }= require('googleapis');
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
      
      const fileId = '1NHvRQtxhvyliHAQqCU-K7dtfYJiJPRl8';
  
      
      const downloadPath = path.join(__dirname, 'downloads', 'video.mp4');
  
      
      const fileMetadata = await drive.files.get({ fileId, fields: 'id,name'});
  
 
      const response = fs.createWriteStream(downloadPath);

      const { data } = await drive.files.get(
        {
          fileId: fileMetadata.data.id,
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
        mimeType: 'video/*', 
        body: fs.createReadStream(downloadPath),
      };
     //uploading into google drive to a specific folder
      await drive.files.create({
        media,
        resource: {
          name: " ",
          parents: '1NXByG5NvoNx84e_-fXvH9jfpTy3cESKb',
        },
      });

      res.status(200).send('Video downloaded and uploaded successfully.');
    
      

      response.on('error', (err) => {
        console.error('Error downloading video:', err);
        res.status(500).send('Error downloading video.');
      });
    } catch (error) {

      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  