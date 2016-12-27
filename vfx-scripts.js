const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

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

function paintToCanvas() {
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    // create random positions
    

    return setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);
    //    ctx.globalAlpha = 0.3;
        // take the pixels
        let pixels = ctx.getImageData(0,0,width, height);
        // vfx
  //      pixels = videoEffect(pixels);
  //      pixels = rgbSplit(pixels);
  //      pixels = greenScreen(pixels);
        // put back
  //      ctx.putImageData(pixels, 0, 0);
        let size = 6;
        for(let i=0; i<size; i++) {
            for(let j=0; j<size; j++) {
                let block = ctx.getImageData(j*width/size, i*height/size, width/size, height/size)
                ctx.putImageData(block, (size-j)*width/size, (size-i)*height/size);
            }
        }

    }, 450);
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

getVideo();
video.addEventListener('canplay', paintToCanvas);