import { ACCESS_KEY_ID, SECRET_ACCESS_KEY } from "./config.js";

AWS.config.update({
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
    region: 'us-east-1',
});

const s3 = new AWS.S3();

const bucketName = 'griffinsphotos';

let bucketObjects = [];

function getObjects() {
    const params = { Bucket: bucketName };

    s3.listObjects(params, function (err, data) {
        if (err) {
            console.error('Error listing objects: ', err);
        } else {
            bucketObjects = data.Contents;
            pickRandomImg();
        }
    });
}

function pickRandomImg() {
    if (bucketObjects.length) {
        let index = Math.floor(Math.random() * bucketObjects.length);
        const url = "https://griffinsphotos.s3.amazonaws.com/" + bucketObjects[index].Key;

        document.getElementById("main-image").src = url;
    }
}

getObjects();