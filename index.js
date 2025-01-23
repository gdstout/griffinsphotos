import { ACCESS_KEY_ID, SECRET_ACCESS_KEY } from "./config.js";

AWS.config.update({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
  region: "us-east-1",
});

const s3 = new AWS.S3();

const bucketName = "griffinsphotos";

let bucketObjects = [];
let metadata = {};
let scrambledArray = [];
let currentIndex = -1;

/**
 * Gets a list of the objects in the bucket and stores them in the bucketObjects array.
 * Fetches the metadata.json file and stores it in the metadata object.
 */
function performSetup() {
  const params = { Bucket: bucketName };

  try {
    s3.listObjects(params, function (err, data) {
      if (err) {
        console.error("Error listing objects: ", err);
      } else {
        bucketObjects = data.Contents;
        scrambledArray = createScrambledArray(bucketObjects.length);

        fetch("https://griffinsphotos.s3.amazonaws.com/metadata.json")
          .then((response) => {
            if (!response.ok) {
              throw new Error("Error fetching photo metadata.");
            }
            return response.json();
          })
          .then((data) => {
            metadata = data;
            goToNextImage();
          })
          .catch((error) => {
            console.error("Fetch Issue: " + error);
          });
      }
    });
  } catch (err) {
    console.error("Error during setup: " + err);
  }
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

export async function goToNextImage() {
  document.getElementById("content").className = "content-hidden";

  if (currentIndex < bucketObjects.length) {
    currentIndex ++;
  } else {
    currentIndex = 0;
  }

  const url =
    "https://griffinsphotos.s3.amazonaws.com/" +
    bucketObjects[scrambledArray[currentIndex]].Key;

  let img = document.getElementById("main-image");
  img.src = url;
  img.onload = function () {
    document.getElementById("content").className = "content";
  }


  try {
    document.getElementById("title").innerHTML =
      metadata[bucketObjects[scrambledArray[currentIndex]].Key].title;
    document.getElementById("description").innerHTML =
      metadata[bucketObjects[scrambledArray[currentIndex]].Key].description;
  } catch (err) {
    console.error("Couldn't find metadata for this image...");
    document.getElementById("title").innerHTML = "Untitled";
    document.getElementById("description").innerHTML = "No information.";
  }
}
window.goToNextImage = goToNextImage;

/**
 * This section defines variables and functions to determine if a mobile
 * user has swiped to see the next picture.
 */
let touchStartX = 0;
let touchEndX = 0;
let touchStartTime = null;
let touchDuration = null;

function checkDirection() {
  if (touchDuration <= 300) {
    if (touchEndX < touchStartX) {
      pickRandomImg();
    }
    if (touchEndX > touchStartX) {
      pickRandomImg();
    }
  }
}

document.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartTime = new Date().getTime();
});

document.addEventListener("touchend", (e) => {
  touchDuration = new Date().getTime() - touchStartTime;
  touchEndX = e.changedTouches[0].screenX;
  checkDirection();
});


/**
 * Initiate the first load of data
 */
performSetup();
