const uploadButton = document.getElementById("uploadButton");
const imageInput = document.getElementById("imageInput");
const thumbnailGrid = document.getElementById("thumbnailGrid");


// =========================
// OPEN FILE SELECTION
// =========================

uploadButton.addEventListener("click", function () {
    imageInput.click();
});


// =========================
// HANDLE SELECTED IMAGES
// =========================

imageInput.addEventListener("change", function () {

    const files = Array.from(imageInput.files);

    files.forEach(function (file) {

        // Only allow image files
        if (!file.type.startsWith("image/")) {
            return;
        }

        // Create temporary browser URL
        const imageURL = URL.createObjectURL(file);

        // Create thumbnail
        const thumbnail = document.createElement("img");

        thumbnail.classList.add("thumbnail");

        thumbnail.src = imageURL;

        thumbnail.alt = file.name;

        // Add thumbnail to webpage
        thumbnailGrid.appendChild(thumbnail);

    });

});