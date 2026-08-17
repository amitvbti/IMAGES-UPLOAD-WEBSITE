const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyBU8w4FGaq6G2G55hcZb-LOv2_MwdpdnV4KwaV41ki-i8fJ_vGmOkgUZDMJ4r5q22J5Q/exec";


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
   CURRENT BATCH OF FILES
   ========================= */

let selectedFiles = [];


/* =========================
   SELECT IMAGES
   ========================= */

selectImagesButton.addEventListener("click", function () {

    imageInput.click();

});


/* =========================
   WHEN IMAGES ARE SELECTED
   ========================= */

imageInput.addEventListener("change", function () {

    const files =
        Array.from(imageInput.files);


    files.forEach(function (file) {

        if (!file.type.startsWith("image/")) {
            return;
        }


        selectedFiles.push(file);

        createThumbnail(file);

    });


    updateFinalUploadButton();


    /*
     * Clear the input so the same file
     * can be selected again later.
     */

    imageInput.value = "";

});


/* =========================
   CREATE THUMBNAIL
   ========================= */

function createThumbnail(file) {

    const imageURL =
        URL.createObjectURL(file);


    const card =
        document.createElement("div");

    card.classList.add("thumbnail-card");


    /* IMAGE */

    const thumbnail =
        document.createElement("img");

    thumbnail.classList.add("thumbnail");

    thumbnail.src = imageURL;

    thumbnail.alt = file.name;


    /* REMOVE BUTTON */

    const removeButton =
        document.createElement("button");

    removeButton.classList.add(
        "remove-image-button"
    );

    removeButton.type = "button";

    removeButton.innerHTML = "×";


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


    /* PROGRESS */

    const progressContainer =
        document.createElement("div");

    progressContainer.classList.add(
        "progress-container"
    );


    const progressBar =
        document.createElement("div");

    progressBar.classList.add(
        "progress-bar"
    );


    progressContainer.appendChild(
        progressBar
    );


    /* STORE REFERENCES */

    card.file = file;

    card.progressBar = progressBar;

    card.thumbnail = thumbnail;


    /* BUILD CARD */

    card.appendChild(thumbnail);

    card.appendChild(removeButton);

    card.appendChild(progressContainer);


    thumbnailGrid.appendChild(card);

}


/* =========================
   SHOW / HIDE UPLOAD BUTTON
   ========================= */

function updateFinalUploadButton() {

    if (selectedFiles.length > 0) {

        finalUploadContainer.style.display =
            "block";

        finalUploadButton.disabled =
            false;

        finalUploadButton.textContent =
            "UPLOAD SELECTED PHOTOS";

    } else {

        finalUploadContainer.style.display =
            "none";

    }

}


/* =========================
   UPLOAD SELECTED PHOTOS
   ========================= */

finalUploadButton.addEventListener(
    "click",
    async function () {

        if (selectedFiles.length === 0) {
            return;
        }


        /*
         * Take a copy of the current batch.
         * This allows us to clear the batch
         * after uploading.
         */

        const filesToUpload =
            [...selectedFiles];


        finalUploadButton.disabled = true;

        finalUploadButton.textContent =
            "UPLOADING...";


        for (const file of filesToUpload) {

            await uploadFile(file);

        }


        /*
         * Current batch is finished.
         */

        selectedFiles = [];


        finalUploadButton.disabled = false;

        finalUploadButton.textContent =
            "UPLOAD COMPLETE";


        /*
         * Hide the upload button because
         * there are no pending files.
         *
         * SELECT IMAGES remains active.
         */

        finalUploadContainer.style.display =
            "none";

    }
);


/* =========================
   UPLOAD ONE FILE
   ========================= */

function uploadFile(file) {

    return new Promise(function (resolve) {

        const reader =
            new FileReader();


        reader.onload = async function () {

            const card =
                findCardForFile(file);


            if (!card) {

                resolve();

                return;

            }


            try {

                /*
                 * Convert image to Base64
                 */

                const base64Data =
                    reader.result.split(",")[1];


                /*
                 * Initial progress
                 */

                card.progressBar.style.width =
                    "10%";


                const uploadData = {

                    fileName: file.name,

                    mimeType: file.type,

                    fileData: base64Data

                };


                /*
                 * Send to Google Apps Script
                 */

                const response =
                    await fetch(
                        GOOGLE_SCRIPT_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "text/plain;charset=utf-8"
                            },

                            body:
                                JSON.stringify(
                                    uploadData
                                )
                        }
                    );


                /*
                 * Almost complete
                 */

                card.progressBar.style.width =
                    "90%";


                const result =
                    await response.json();


                /*
                 * SUCCESS
                 */

                if (result.success) {

                    card.progressBar.style.width =
                        "100%";

                    card.progressBar.style.background =
                        "#555555";

                    card.thumbnail.style.opacity =
                        "0.65";

                }


                /*
                 * FAILED
                 */

                else {

                    card.progressBar.style.background =
                        "#999999";

                    console.error(
                        "Upload failed:",
                        result.error
                    );

                }


            } catch (error) {

                console.error(
                    "Upload error:",
                    error
                );


                card.progressBar.style.background =
                    "#999999";

            }


            resolve();

        };


        reader.onerror = function () {

            console.error(
                "Could not read file:",
                file.name
            );

            resolve();

        };


        reader.readAsDataURL(file);

    });

}


/* =========================
   FIND CARD FOR FILE
   ========================= */

function findCardForFile(file) {

    const cards =
        document.querySelectorAll(
            ".thumbnail-card"
        );


    for (const card of cards) {

        if (card.file === file) {

            return card;

        }

    }


    return null;

}