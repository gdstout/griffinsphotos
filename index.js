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

async function pickRandomImg() {
    if (bucketObjects.length) {
        try {
            fetch("https://griffinsphotos.s3.amazonaws.com/metadata.json")
                .then(response => {
                    return response.json();
                })
                .then(json => {

                    let index = Math.floor(Math.random() * bucketObjects.length);
                    const url = "https://griffinsphotos.s3.amazonaws.com/" + bucketObjects[index].Key;

                    let img = new Image();
                    img.onload = async function() {
                        document.getElementById("content").appendChild(img);
                        await new Promise(r => setTimeout(r, 500));
                        document.getElementsByClassName("main").hidden = false;
                    }
                    img.className="main-image"
                    img.src = url;
                    try {
                        document.getElementById("title").innerHTML = json[bucketObjects[index].Key].title;
                        document.getElementById("description").innerHTML = json[bucketObjects[index].Key].description;
                    } catch (err) {
                        console.log("Couldn't get info for this image...");
                        document.getElementById("title").innerHTML = "Untitled";
                        document.getElementById("description").innerHTML = "No information."

                    }
                });
        } catch (err) {
            console.log(err);
        }

    }
}

getObjects();