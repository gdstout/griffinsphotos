console.log("HELLO FROM AMPLIFY");

import {ACCESS_KEY_ID, SECRET_ACCESS_KEY} from "./config.js";


AWS.config.update({
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
    region: 'us-east-1',
});

const s3 = new AWS.S3();

const bucketName = 'griffinsphotos';

function listObjects() {
    const params = { Bucket: bucketName };

    s3.listObjects(params, function (err, data) {
        if (err) {
            console.error('Error listing objects: ', err);
        } else {
            console.log('Objects in the bucket: ', data.Contents);
            // Process the objects as needed
		
        }
    });
}

// Call the function to list objects when the page loads
listObjects();