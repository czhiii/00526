let video;
let facemesh;
let handpose;
let predictions = [];
let handPredictions = [];
let gesture = "";

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // 初始化 Facemesh
  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  // 初始化 Handpose
  handpose = ml5.handpose(video, modelReady);
  handpose.on('predict', results => {
    handPredictions = results;
    detectGesture();
  });
}

function modelReady() {
  console.log("模型載入完成");
}

function draw() {
  image(video, 0, 0, width, height);

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    // 根據手勢移動圓圈位置
    let x, y;
    if (gesture === "rock") {
      // 左右眼睛
      [x, y] = keypoints[159];
    } else if (gesture === "scissors") {
      // 額頭
      [x, y] = keypoints[10];
    } else if (gesture === "paper") {
      // 左右臉頰
      [x, y] = keypoints[234];
    } else {
      // 預設位置（第94點）
      [x, y] = keypoints[94];
    }

    noFill();
    stroke(255, 0, 0);
    strokeWeight(2); // 縮小線條粗細
    ellipse(x, y, 50, 50); // 縮小圓圈大小
  }
}

// 偵測手勢
function detectGesture() {
  if (handPredictions.length > 0) {
    const landmarks = handPredictions[0].landmarks;

    // 簡單的手勢判斷邏輯
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const thumbIndexDist = dist(thumbTip[0], thumbTip[1], indexTip[0], indexTip[1]);
    const indexMiddleDist = dist(indexTip[0], indexTip[1], middleTip[0], middleTip[1]);

    if (thumbIndexDist < 30 && indexMiddleDist > 50) {
      gesture = "rock"; // 石頭
    } else if (indexMiddleDist < 30) {
      gesture = "scissors"; // 剪刀
    } else {
      gesture = "paper"; // 布
    }
  }
}
