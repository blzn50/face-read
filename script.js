const webcam = document.getElementById('webcam');
const container = document.querySelector('.container');
const info = document.getElementById('info');

Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
  // faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.ageGenderNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
  // faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  // faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
]).then(startVideo);

async function startVideo() {
  if (navigator.mediaDevices) {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      webcam.srcObject = s;
    } catch (error) {
      console.log(error);
    }
  }
}

webcam.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(webcam);
  const displaySize = { width: webcam.width, height: webcam.height };
  container.appendChild(canvas);
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const faces = await faceapi
      .detectAllFaces(webcam)
      // .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    if (faces.length > 0) {
      info.style.display = 'none';
    }

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    const resizedFaces = faceapi.resizeResults(faces, displaySize);

    faceapi.draw.drawDetections(canvas, resizedFaces);
    // faceapi.draw.drawFaceLandmarks(canvas, resizedFaces);
    faceapi.draw.drawFaceExpressions(canvas, resizedFaces);

    resizedFaces.forEach((face) => {
      const { age, gender, genderProbability } = face;
      new faceapi.draw.DrawTextField(
        [
          `${faceapi.utils.round(age, 0)} years`,
          `${gender} (${faceapi.utils.round(genderProbability)})`,
        ],
        face.detection.box.bottomRight
      ).draw(canvas);
    });
  }, 1000);
});
