"use strict";

const FILE_TYPES = ["png", "jpeg"];
let prevImage;

document.addEventListener("DOMContentLoaded", init);

function init(e) {
    let canvas = document.querySelector("canvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    document.getElementById("fileUploader").addEventListener("change", (err) => onUploadImage(err, canvas));
    document.getElementById("restoreNormal").addEventListener("click", (err) => reload(err, canvas));
    document.getElementById("download").addEventListener('click', (err) => dlCanvas(err, canvas));

    document.getElementById("greyScale").addEventListener("click", (err) => greyScaleTransformCanvas(err, canvas));
    document.getElementById("blackWhite").addEventListener("click", (err) => blackWhiteTransformCanvas(err, canvas, 128));
    document.getElementById("greyLayers").addEventListener("click", (err) => greyLayerTransformCanvas(err, canvas));
}

function onUploadImage(e, canvas) {
    if(e !== null) {
        e.preventDefault();
    }

    let fileUploader = document.getElementById("fileUploader");

    if ('files' in fileUploader) {
        let file = fileUploader.files[0];
        if(checkFileExtension(file, FILE_TYPES)) {
            let img = new Image();

            img.onload = function() {
                drawImage(img, canvas);
                console.log('the image is drawn');
                console.log(this);
            };

            img.src = URL.createObjectURL(file);
            prevImage = img.src;
        } else {
            console.log("Bad file type.");
        }
    }

    fileUploader.value = null;
}

function checkFileExtension(file, extensions) {
    return 0 <= extensions.indexOf(file.type.split("/")[1]);
}

function drawImage(img, canvas) {
    let ctx = canvas.getContext("2d");

    let width = img.width;
    let height = img.height;

    canvas.height = height;
    canvas.width = width;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.drawImage(img, 0, 0);
}

function reload(e, canvas) {
    if(e !== null)
        e.preventDefault();

    let img = new Image();

    img.onload = function() {
        drawImage(img, canvas);
        console.log('the image is drawn');
        console.log(this);
    };

    img.src = prevImage;
}

function greyScaleTransformCanvas(e, canvas) {
    if(e !== null)
        e.preventDefault();

    let ctx = canvas.getContext("2d");
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let grey = 0;

    for(let i=0; i<imageData.data.length; i+=4) {
        grey = Math.floor(imageData.data[i] * 0.3 + imageData.data[i+1] * 0.59 + imageData.data[i+2] * 0.11);

        imageData.data[i] = grey;
        imageData.data[i+1] = grey;
        imageData.data[i+2] = grey;
    }

    ctx.putImageData(imageData, 0, 0);
}

function blackWhiteTransformCanvas(e, canvas, threshold) {
    if(e !== null)
        e.preventDefault();

    let ctx = canvas.getContext("2d");
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let grey = 0;
    let bw = 0;

    let error = 0;

    let amountOfWhitePoints = 0;
    let amountOfBlackPoints = 0;

    for(let i=0; i<imageData.data.length; i+=4) {

        grey = Math.floor(imageData.data[i] * 0.3 + imageData.data[i+1] * 0.59 + imageData.data[i+2] * 0.11);

        if((grey + error) <= threshold) {
            bw = 0;
            error += grey;
            amountOfBlackPoints++;
        } else {
            bw = 255;
            error -= (bw - grey);
            amountOfWhitePoints++;
        }

        imageData.data[i] = bw;
        imageData.data[i+1] = bw;
        imageData.data[i+2] = bw;
    }

    ctx.putImageData(imageData, 0, 0);
}

function greyLayerTransformCanvas(e, canvas) {
    if(e !== null)
        e.preventDefault();

    let ctx = canvas.getContext("2d");
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let amountOfLayers = document.getElementById("greyLayersValue").value;

    let grey;

    for(let i=0; i<imageData.data.length; i+=4) {

        grey = Math.floor(imageData.data[i] * 0.3 + imageData.data[i+1] * 0.59 + imageData.data[i+2] * 0.11);
        grey = getLayer(grey, amountOfLayers, 0, 255);

        imageData.data[i] = grey;
        imageData.data[i+1] = grey;
        imageData.data[i+2] = grey;
    }

    ctx.putImageData(imageData, 0, 0);
}

function getLayer(value, amountOfLayers, minValue, maxValue) {
    let endColorStep = (maxValue - minValue) / (amountOfLayers - 1);
    let layerStep = (maxValue - minValue + 1) / amountOfLayers;

    return Math.round(Math.floor(value / layerStep) * endColorStep);
}

function dataURLtoBlob(dataurl) {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bStr = atob(arr[1]), n = bStr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bStr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

function dlCanvas(e, canvas) {
    e.preventDefault();

    let link = document.createElement("a");
    let imgData = canvas.toDataURL({
        format: 'png',
        multiplier: 4
    });
    let strDataURI = imgData.substr(22, imgData.length);
    let blob = dataURLtoBlob(imgData);
    let objUrl = URL.createObjectURL(blob);

    link.download = "b4_" + new Date().valueOf() + ".png";

    link.href = objUrl;

    link.click();
}