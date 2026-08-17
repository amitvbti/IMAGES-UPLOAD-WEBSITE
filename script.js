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
   SELECTED FILES
   ========================= */

let selectedFiles = [];


/* =========================
   SELECT IMAGES BUTTON
   ========================= */

selectImagesButton.addEventListener("click", function () {

    imageInput.click();

});


/* =========================
   FILE SELECTION
   ========================= */

imageInput.addEventListener("change", function () {

    const newFiles =
        Array.from(imageInput.files);


    newFiles.forEach(function (file) {

        if (!file.type.startsWith("image/")) {
            return;
        }


        selectedFiles.push(file);

        createThumbnail(file);

    });


    updateFinalUploadButton();

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


    /* Progress */

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


    /* Store references */

    card.file = file;

    card.progressBar = progressBar;

    card.thumbnail = thumbnail;


    /* Build card */

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


        finalUploadButton.disabled = true;

        finalUploadButton.textContent =
            "UPLOADING...";


        const filesToUpload =
            [...selectedFiles];


        for (const file of filesToUpload) {

            await uploadFile(file);

        }


        finalUploadButton.textContent =
            "UPLOAD COMPLETE";

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

            try {

                const base64Data =
                    reader.result.split(",")[1];


                const card =
                    findCardForFile(file);


                if (!card) {

                    resolve();

                    return;

                }


                /* Start progress */

                card.progressBar.style.width =
                    "10%";


                const uploadData = {

                    fileName: file.name,

                    mimeType: file.type,

                    fileData: base64Data

                };


                /*
                 * Send file to Google Apps Script
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


                card.progressBar.style.width =
                    "90%";


                const result =
                    await response.json();


                if (result.success) {

                    card.progressBar.style.width =
                        "100%";

                    card.progressBar.style.background =
                        "#555555";


                    card.thumbnail.style.opacity =
                        "0.65";

                } else {

                    card.progressBar.style.background =
                        "#999999";

                    console.error(
                        result.error
                    );

                }


            } catch (error) {

                console.error(
                    "Upload error:",
                    error
                );

                const card =
                    findCardForFile(file);


                if (card) {

                    card.progressBar.style.background =
                        "#999999";

                }

            }


            resolve();

        };


        reader.onerror = function () {

            resolve();

        };


        reader.readAsDataURL(file);

    });

}


/* =========================
   FIND IMAGE CARD
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