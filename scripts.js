const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const canvas2 = document.querySelector('.photo2');
const ctx2 = canvas2.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');
const splits = document.querySelector('.split');
let options = [];
let posn = [];
let size = 6;
let emptyX = 0;
let emptyY = 0;
    
function getVideo() {
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(localMediaStream => {
            console.log(localMediaStream);
            video.src = window.URL.createObjectURL(localMediaStream);
            video.play();
        })
        .catch(err => {
            console.error('Not allowed...?', err);
        })
}

function resetPuzzle() {
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;
    canvas2.width = width;
    canvas2.height = height;

    size = parseInt(splits.value);
    options = [];
    posn = [];
        
    // create all positions
    for (let n=0; n<size*size; n++) {
        options.push(n);
    }
    console.log({options});
    // create random positions
    for (let n=0; n<size*size; n++) {
        let val = Math.floor(Math.random()*options.length);
        posn.push(options[val]);
        options.splice(val,1);
    }
    let n = posn[size*size-1];
    emptyY = Math.floor(n/size);
    emptyX = n % size;
 //   console.log({posn, emptyX, emptyY});
}

function paintToCanvas() {
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;
    canvas2.width = width;
    canvas2.height = height;

    return setInterval(() => {
 //   console.log(posn);

        ctx.drawImage(video, 0, 0, width, height);
    //    ctx.globalAlpha = 0.3;
        // take the pixels
        let pixels = ctx.getImageData(0,0,width, height);
        // vfx
  //      pixels = videoEffect(pixels);
  //      pixels = rgbSplit(pixels);
  //      pixels = greenScreen(pixels);
        // black square - empty
        pixels = clearFinal(pixels, width, height, size);
        // put back
        ctx.putImageData(pixels, 0, 0);

        for(let i=0; i<size; i++) {
            for(let j=0; j<size; j++) {
                let pos = posn[i*size + j];  // random position
                let down = Math.floor(pos/size);
                let across = pos % size;
  //              console.log({pos, across, down})
                let block = ctx.getImageData(j*width/size, i*height/size, width/size, height/size)
                ctx2.putImageData(block, across*width/size, down*height/size);
            }
        }
// debugger;
    }, 1000);
}

function clickPuzzle(e) {   
    const width = video.videoWidth;
    const height = video.videoHeight;
    
    let blockWidth = Math.floor(width / size);
    let blockHeight = Math.floor(height / size);

 //   console.log(e);
    let n = 0;
    let clickX =  Math.floor(e.offsetX/blockWidth);
    let clickY =  Math.floor(e.offsetY/blockHeight);
    console.log({ emptyX, emptyY, clickX, clickY});
 
    if (emptyX != clickX || emptyY != clickY) {
        // not click on the empty block
        if (emptyX === clickX) {
            // same column
             console.log("same col", emptyY, clickY);
            if (emptyY < clickY) {
                for (let row=emptyY; row < clickY; row++) {
                    n = row * size + clickX;
                    posn[n] = posn[n+size];
                    n += size;
                }
                posn[n] = size*size - 1;
                console.log({n});
            } else {
                for (let row=emptyY; row > clickY; row--) {
                    n = row * size + clickX;
                    posn[n] = posn[n+size];
                    n -= size;
                }
                posn[n] = size*size - 1;                
            }

        } else if (emptyY === clickY) {
            // same row 
            console.log("same row");
        }
    }

    console.log(JSON.stringify(posn));

}

function clearFinal(pixels, width, height, size) {
    let blockWidth = Math.floor(width / size);
    let blockHeight = Math.floor(height / size);

    let rowLength = width;
    let start = rowLength * blockHeight * (size-1) + blockWidth * (size-1);
    start *= 4; // per colour

// console.log({rowLength, blockWidth, blockHeight, size, start});

    for (let j=0; j<blockHeight; j++) {
  //      console.log({start});
        for (let i=0; i<blockWidth*4; i+=4) {
            pixels.data[start+i+0] = 0;
            pixels.data[start+i+1] = 255;
            pixels.data[start+i+2] = 0;
        }
        start += rowLength * 4;
    }
    return pixels;
}

function takePhoto() {
    snap.currentTime=0;
    snap.play();

    // get data from canvas, to download
    const data = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.href = data;
    link.setAttribute('download', 'facepic');
    link.innerHTML = `<img src="${data}" alt="face pic" />`;
    strip.insertBefore(link, strip.firstChild); 
}

function videoEffect(pixels) {
    for (let i=0; i<pixels.data.length; i+=4) {
        pixels.data[i+0] = pixels.data[i+0] + 100;
        pixels.data[i+1] = pixels.data[i+1] - 50;
        pixels.data[i+2] = pixels.data[i+2] * 0.5;
    }
    return pixels;
}

function rgbSplit(pixels) {
    for (let i=0; i<pixels.data.length; i+=4) {
        pixels.data[i-150] = pixels.data[i+0];
        pixels.data[i+500] = pixels.data[i+1];
        pixels.data[i-500] = pixels.data[i+2];
    }
    return pixels;
}

function greenScreen(pixels) {
    const levels = {};
    document.querySelectorAll('.rgb input').forEach((input) => {
        levels[input.name] = input.value;
    });

 //   console.log(levels);

    return pixels;
}

resetPuzzle();
getVideo();
video.addEventListener('canplay', paintToCanvas);
canvas2.addEventListener('click', clickPuzzle, false);