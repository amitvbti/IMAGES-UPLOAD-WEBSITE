const selectImagesButton =
    document.getElementById("selectImagesButton");

const imageInput =
    document.getElementById("imageInput");

const thumbnailGrid =
    document.getElementById("thumbnailGrid");

const finalUploadContainer =
    document.getElementById("finalUploadContainer");

const finalUploadButton =
    document.getElementById("finalUploadButton");


/* =========================
   SELECT IMAGES
   ========================= */

selectImagesButton.addEventListener("click", function () {

    imageInput.click();

});


/* =========================
   STORE SELECTED FILES
   ========================= */

let selectedFiles = [];


/* =========================
   WHEN FILES ARE SELECTED
   ========================= */

imageInput.addEventListener("change", function () {

    const newFiles = Array.from(imageInput.files);

    newFiles.forEach(function (file) {

        if (!file.type.startsWith("image/")) {
            return;
        }

        selectedFiles.push(file);

        createThumbnail(file);

    });


    updateFinalUploadButton();

    // Allow selecting the same file again later
    imageInput.value = "";

});


/* =========================
   CREATE THUMBNAIL
   ========================= */

function createThumbnail(file) {

    const imageURL =
        URL.createObjectURL(file);


    /* Image card */

    const card =
        document.createElement("div");

    card.classList.add("thumbnail-card");


    /* Image */

    const thumbnail =
        document.createElement("img");

    thumbnail.classList.add("thumbnail");

    thumbnail.src = imageURL;

    thumbnail.alt = file.name;


    /* Remove button */

    const removeButton =
        document.createElement("button");

    removeButton.classList.add(
        "remove-image-button"
    );

    removeButton.type = "button";

    removeButton.innerHTML = "×";


    /* Remove image */

    removeButton.addEventListener(
        "click",
        function () {

            const index =
                selectedFiles.indexOf(file);

            if (index !== -1) {

                selectedFiles.splice(index, 1);

            }

            card.remove();

            updateFinalUploadButton();

            URL.revokeObjectURL(imageURL);

        }
    );


    /* Progress container */

    const progressContainer =
        document.createElement("div");

    progressContainer.classList.add(
        "progress-container"
    );


    /* Progress bar */

    const progressBar =
        document.createElement("div");

    progressBar.classList.add(
        "progress-bar"
    );


    progressContainer.appendChild(
        progressBar
    );


    /* Build card */

    card.appendChild(thumbnail);

    card.appendChild(removeButton);

    card.appendChild(progressContainer);


    thumbnailGrid.appendChild(card);

}


/* =========================
   SHOW / HIDE FINAL BUTTON
   ========================= */

function updateFinalUploadButton() {

    if (selectedFiles.length > 0) {

        finalUploadContainer.style.display =
            "block";

    } else {

        finalUploadContainer.style.display =
            "none";

    }

}


/* =========================
   FINAL UPLOAD BUTTON
   ========================= */

finalUploadButton.addEventListener(
    "click",
    function () {

        console.log(
            "Selected files:",
            selectedFiles
        );

        alert(
            selectedFiles.length +
            " photos selected for upload."
        );

    }
);