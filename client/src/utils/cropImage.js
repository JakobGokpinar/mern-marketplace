const createImage = async (url) =>
    new Promise((resolve, reject) => {
        var newImage = new Image();
        newImage.addEventListener("load", () => resolve(newImage));
        newImage.addEventListener("error", (error) => reject(error));
        newImage.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
        newImage.src = url;
    });


export const getCroppedImage = async (imageSrc) => {
    const myImage = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = myImage.width;
    canvas.height = myImage.height;

    // draw rotated image and store data.
    ctx.drawImage(
        myImage,
        0, 0, myImage.width, myImage.height
    );

    const data = ctx.getImageData(0, 0, 100,100);

    // paste generated rotate image with correct offsets for x,y crop values.
    ctx.putImageData(
        data, 150, 0, 0, 0, 0, 0
    );

    // As Base64 string
    // return canvas.toDataURL("image/jpeg");
    return canvas;
}

// modgetCroppedImageule.exports = {createImage, getCroppedImage}
