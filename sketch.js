// sketch.js

// First of all, shut glitch up about p5's global namespace pollution using this magic comment:
/* global describe p5 setup draw P2D WEBGL ARROW CROSS HAND MOVE TEXT WAIT HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS DEG_TO_RAD RAD_TO_DEG CORNER CORNERS RADIUS RIGHT LEFT CENTER TOP BOTTOM BASELINE POINTS LINES LINE_STRIP LINE_LOOP TRIANGLES TRIANGLE_FAN TRIANGLE_STRIP QUADS QUAD_STRIP TESS CLOSE OPEN CHORD PIE PROJECT SQUARE ROUND BEVEL MITER RGB HSB HSL AUTO ALT BACKSPACE CONTROL DELETE DOWN_ARROW ENTER ESCAPE LEFT_ARROW OPTION RETURN RIGHT_ARROW SHIFT TAB UP_ARROW BLEND REMOVE ADD DARKEST LIGHTEST DIFFERENCE SUBTRACT EXCLUSION MULTIPLY SCREEN REPLACE OVERLAY HARD_LIGHT SOFT_LIGHT DODGE BURN THRESHOLD GRAY OPAQUE INVERT POSTERIZE DILATE ERODE BLUR NORMAL ITALIC BOLD BOLDITALIC LINEAR QUADRATIC BEZIER CURVE STROKE FILL TEXTURE IMMEDIATE IMAGE NEAREST REPEAT CLAMP MIRROR LANDSCAPE PORTRAIT GRID AXES frameCount deltaTime focused cursor frameRate getFrameRate setFrameRate noCursor displayWidth displayHeight windowWidth windowHeight width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams pushStyle popStyle popMatrix pushMatrix registerPromisePreload camera perspective ortho frustum createCamera setCamera setAttributes createCanvas resizeCanvas noCanvas createGraphics blendMode noLoop loop push pop redraw applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase createStringDict createNumberDict storeItem getItem clearStorage removeItem select selectAll removeElements createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ pRotateDirectionX pRotateDirectionY pRotateDirectionZ turnAxis setMoveThreshold setShakeThreshold isKeyPressed keyIsPressed key keyCode keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveGif saveFrames loadImage image tint noTint imageMode pixels blend copy filter get loadPixels set updatePixels loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo createWriter save saveJSON saveJSONObject saveJSONArray saveStrings saveTable writeFile downloadFile abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont append arrayCopy concat reverse shorten shuffle sort splice subset float int str boolean byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim day hour minute millis month second year plane box sphere cylinder cone ellipsoid torus orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadModel model loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess remove canvas drawingContext*/
// Also socket.io, tensorflow and handpose's:
/* global describe handpose tf io*/
// now any other lint errors will be your own problem

var handposeModel = null; // this will be loaded with the handpose model
                          // WARNING: do NOT call it 'model', because p5 already has something called 'model'
// var delay = false;
// const delayTime = 5000;

var modeTetra = false;

var videoDataLoaded = false; // is webcam capture ready?

var statusText = "Loading handpose model...";

var myHands = []; // hands detected by mediapipe
                  // currently handpose only supports single hand, so this will be either empty or singleton

var capture; // webcam capture, managed by p5.js

// Load the MediaPipe handpose model assets.
handpose.load().then(function(_model){
  console.log("model initialized.")
  statusText = "Model loaded."
  handposeModel = _model;
})


function setup() {
  createCanvas(window.innerWidth,window.innerHeight);
  capture = createCapture(VIDEO);
  
  // this is to make sure the capture is loaded before asking handpose to take a look
  // otherwise handpose will be very unhappy
  capture.elt.onloadeddata = function(){
    console.log("video initialized");
    videoDataLoaded = true;
  }
  
  capture.hide();
}

function disableDelayMode(){
    delay = false;
}
function lookAtPinch(hands){
        for (let i = 0; i < hands.length; i++){

            let d = Math.sqrt(Math.pow((hands[i].landmarks[4][0] - hands[i].landmarks[8][0]),2) +
            Math.pow((hands[i].landmarks[4][1] - hands[i].landmarks[8][1]),2) + 
            Math.pow((hands[i].landmarks[4][2] - hands[i].landmarks[8][2]),2));
            if(d < 50){
                let pos = window.innerWidth - hands[i].landmarks[11][0];
                document.dispatchEvent(new MouseEvent('mousedown', {
                    view: window,
                    button: 0,
                    bubbles: true,
                    cancelable: true,
                    clientX: pos,
                    clientY: hands[i].landmarks[12][1],
                  }));          
            }
        }
    
}
function lookAtMode(hands){
    if(modeTetra){
        for (let i = 0; i < hands.length; i++){
            let d = Math.sqrt(Math.pow((hands[i].landmarks[4][0] - hands[i].landmarks[20][0]),2) +
                    Math.pow((hands[i].landmarks[4][1] - hands[i].landmarks[20][1]),2) + 
                    Math.pow((hands[i].landmarks[4][2] - hands[i].landmarks[20][2]),2));
            if(d > 100){
                modeTetra = false;
            }
        }
    }
    
}
function lookAtPinchTetra(hands){
    if(!modeTetra){
        for (let i = 0; i < hands.length; i++){

            let d = Math.sqrt(Math.pow((hands[i].landmarks[4][0] - hands[i].landmarks[20][0]),2) +
            Math.pow((hands[i].landmarks[4][1] - hands[i].landmarks[20][1]),2) + 
            Math.pow((hands[i].landmarks[4][2] - hands[i].landmarks[20][2]),2));
            if(d < 20){
                let pos = window.innerWidth - hands[i].landmarks[20][0];
                
                document.dispatchEvent(new KeyboardEvent('keydown', {
                    keyCode: 17
                    }));
                    modeTetra = true;
            }
        }
        
    }
    
}

function lookAtDelete(hands){
    for (let i = 0; i < hands.length; i++){

        let d = Math.sqrt(Math.pow((hands[i].landmarks[4][0] - hands[i].landmarks[16][0]),2) +
        Math.pow((hands[i].landmarks[4][1] - hands[i].landmarks[16][1]),2) + 
        Math.pow((hands[i].landmarks[4][2] - hands[i].landmarks[16][2]),2));
        if(d < 50){
            let pos = window.innerWidth - hands[i].landmarks[11][0];
            document.dispatchEvent(new MouseEvent('contextmenu', {
                view: window,
                button: 0,
                bubbles: true,
                cancelable: true,
                clientX: pos,
                clientY: hands[i].landmarks[12][1],
              }));          
        }
    }
}
// function lookAtPinchCube(hands){
//     for (let i = 0; i < hands.length; i++){

//         let d = Math.sqrt(Math.pow((hands[i].landmarks[4][0] - hands[i].landmarks[16][0]),2) +
//         Math.pow((hands[i].landmarks[4][1] - hands[i].landmarks[16][1]),2) + 
//         Math.pow((hands[i].landmarks[4][2] - hands[i].landmarks[16][2]),2));
//         if(d < 20){
//             let pos = window.innerWidth - hands[i].landmarks[16][0];
//             document.dispatchEvent(new KeyboardEvent('keyup', {
//                 keyCode: 17
//                 }));
//         }
//     }
// }

function move(hands){
    for (let i = 0; i < hands.length; i++){
        let pos = window.innerWidth - hands[i].landmarks[12][0];
        document.dispatchEvent(new MouseEvent('mousemove', {
        view: window,
        button: 0,
        bubbles: true,
        cancelable: true,
        clientX: pos,
        clientY: hands[i].landmarks[12][1],
        }));
    }
}
// draw a hand object returned by handpose
// function drawHands(hands,noKeypoints){
  
//   // Each hand object contains a `landmarks` property,
//   // which is an array of 21 3-D landmarks.
//   for (var i = 0; i < hands.length; i++){
//     lookAtPinch(hands);

//   }
// }



function draw() {
    
  if (handposeModel && videoDataLoaded){ // model and video both loaded, 
    
    handposeModel.estimateHands(capture.elt).then(function(_hands){
      // we're handling an async promise
      // best to avoid drawing something here! it might produce weird results due to racing
      
      myHands = _hands; // update the global myHands object with the detected hands
      if (!myHands.length){
        // haven't found any hands
        statusText = "Show some hands!"
      }else{
        // display the confidence, to 3 decimal places
        statusText = "Confidence: "+ (Math.round(myHands[0].handInViewConfidence*1000)/1000);
        
      }
      
    })
  }
  
  background(200);
  // first draw the debug video and annotations
  push();
  scale(0.5); // downscale the webcam capture before drawing, so it doesn't take up too much screen sapce
  image(capture, 0, 0, capture.width, capture.height);
//   filter(INVERT);
  fill(255,0,0);
  stroke(255,0,0);

  lookAtPinch(myHands);
  move(myHands);
  lookAtMode(myHands);
//   lookAtPinchCube(myHands);
  lookAtPinchTetra(myHands);
  lookAtDelete(myHands)
//   drawHands(myHands); // draw my hand skeleton
  pop();
  
  

  
  push();
  fill(255,0,0);
  text(statusText,2,60);
  pop();
}