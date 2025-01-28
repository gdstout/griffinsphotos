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

/**
 * variables to handle the randomness and switching to/loading the next image
 */
let scrambledArray = [];
let firstLoad = true;
let index = 0;
let nextImage = new Image();

/**
 * Gets a list of the objects in the bucket and stores them in the bucketObjects array.
 * Fetches the metadata.json file and stores it in the metadata object.
 */
function performSetup() {
  const awsParams = { Bucket: bucketName };

  const queryParams = new URLSearchParams(window.location.search);
  const params = {};
  for (const [key, value] of queryParams.entries()) {
    params[key] = value;
  }

  try {
    s3.listObjects(awsParams, function (err, data) {
      if (err) {
        console.error("Error listing objects: ", err);
      } else {
        bucketObjects = data.Contents.filter(
          (obj) => obj.Key !== "metadata.json"
        );
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
            if (params.img) {
              // if the query params have an image that matches, find that index and set it to be first
              const bucketIndex = bucketObjects.findIndex(
                (obj) => obj.Key === params.img
              );
              if (bucketIndex > -1) {
                index = scrambledArray.findIndex((num) => num === bucketIndex);
              } else {
                alert(`The image '${params.img}' could not be found!`);
              }
            }
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

  let img = document.getElementById("main-image");

  if (firstLoad) {
    firstLoad = false;
    const url =
      "https://griffinsphotos.s3.amazonaws.com/" +
      bucketObjects[scrambledArray[index]].Key;
    img.src = url;
  } else {
    img.src = nextImage.src;
  }
  img.onload = function () {
    document.getElementById("content").className = "content";
  };

  try {
    document.getElementById("title").innerHTML =
      metadata[bucketObjects[scrambledArray[index]].Key].title;
    document.getElementById("description").innerHTML =
      metadata[bucketObjects[scrambledArray[index]].Key].description;
  } catch (err) {
    console.error("Couldn't find metadata for this image...");
    document.getElementById("title").innerHTML = "Untitled";
    document.getElementById("description").innerHTML = "No information.";
  }

  if (index < bucketObjects.length - 1) {
    index++;
  } else {
    index = 0;
  }

  loadNextImage(index);
}
window.goToNextImage = goToNextImage;

function loadNextImage(i /* index of next image to load */) {
  const url =
    "https://griffinsphotos.s3.amazonaws.com/" +
    bucketObjects[scrambledArray[i]].Key;
  nextImage.src = url;
}

/**
 * Detect a click anywhere on the screen and go to the next picture;
 */
document.addEventListener("click", (e) => {
  if (/Mobi/i.test(navigator.userAgent)) {
    return;
  }
  goToNextImage();
});

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
    if (touchEndX < touchStartX - 100) {
      goToNextImage();
    }
    if (touchEndX > touchStartX + 100) {
      goToNextImage();
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
