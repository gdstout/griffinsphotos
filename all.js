import { ACCESS_KEY_ID, SECRET_ACCESS_KEY } from "./config.js";

AWS.config.update({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
  region: "us-east-1",
});

const s3 = new AWS.S3();

const bucketName = "griffinsphotos";

/**
 * variables to store image and s3 bucket data
 */
let bucketObjects = [];
let metadata = {};

let scrambledArray = [];

/**
 * gets the bucket data and then appends all of the images
 */
function grabAll() {
  console.log("grabbin");
  const params = { Bucket: bucketName };

  s3.listObjects(params, function (err, data) {
    if (err) {
      console.error("Error listing objects: ", err);
    } else {
      bucketObjects = data.Contents.filter(
        (obj) => obj.Key !== "metadata.json"
      );
      scrambledArray = createScrambledArray(bucketObjects.length);

      let img;
      let wrapper;
      let content = document.getElementById("content");
      scrambledArray.forEach((randIndex, i) => {
        wrapper = document.createElement("div");
        wrapper.id = bucketObjects[randIndex].Key;
        +"-wrapper";
        wrapper.className = "img-wrapper";

        img = new Image();
        img.className = "img";
        img.alt = bucketObjects[randIndex].Key;
        img.id = bucketObjects[randIndex].Key;
        img.src =
          "https://griffinsphotos.s3.amazonaws.com/" +
          bucketObjects[randIndex].Key;
        img.onclick= () => window.location.href = `/?img=${bucketObjects[randIndex].Key}`

        if (i === 2) {
          // wrapper.className = "img-wrapper long" // for pano (future)
          img.onload = function () {
            document.getElementById("content").className = "content";
            document.getElementById("loading").className = "not-loading";
          };
        }

        wrapper.appendChild(img);
        content.appendChild(wrapper);
      });
    }
  });
}

/**
 * Creates a scrambled array of X numbers without duplicates.
 */
function createScrambledArray(X) {
  // Create an array of numbers from 0 to X-1
  let array = Array.from({ length: X }, (_, i) => i);

  // Shuffle the array using the Fisher-Yates algorithm
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

grabAll();
