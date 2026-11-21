// 1. Saved Medicines List
let medicineList = JSON.parse(localStorage.getItem("myMedicinesPro")) || [
    {
        name: "Paracetamol 500mg",
        batch: "IND4582",
        expiry: "2027-08-20",
        timing: "After Meal"
    },
    {
        name: "Pan-D Capsule",
        batch: "PAN7741",
        expiry: "2026-12-05",
        timing: "Before Breakfast"
    },
    {
        name: "Cough Syrup (Benadryl)",
        batch: "BEN44",
        expiry: "2025-11-30",
        timing: "At Night"
    }
];

const addBtn = document.getElementById("addBtn");
const medContainer = document.getElementById("medContainer");

// 2. Voice Alert Function (Browser ke Speech API se bolne ka logic)
function speakAlert(message) {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel(); // Purani awaz rokein
        const speech = new SpeechSynthesisUtterance(message);
        speech.lang = "en-IN"; // Indian accent me saaf awaz
        speech.rate = 0.95;
        window.speechSynthesis.speak(speech);
    }
}

// 3. Live Camera Scanner Logic
const startCamBtn = document.getElementById("startCamBtn");
const scanNowBtn = document.getElementById("scanNowBtn");
const cameraFeed = document.getElementById("cameraFeed");
const scanStatus = document.getElementById("scanStatus");
let cameraStream = null;

startCamBtn.addEventListener("click", async function () {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        cameraFeed.srcObject = cameraStream;
        cameraFeed.classList.remove("hidden");
        scanNowBtn.classList.remove("hidden");
        startCamBtn.innerText = "Camera Active";
        scanStatus.innerText = "Align medicine strip and click 'Scan Strip Now'";
    } catch (err) {
        scanStatus.innerText = "Camera blocked! You can still enter details manually.";
    }
});

// Demo Scan Simulation (Judge ke samne strip dikha kar scan karne ke liye)
scanNowBtn.addEventListener("click", function () {
    scanStatus.innerText = "Scanning strip text...";
    setTimeout(() => {
        document.getElementById("medName").value = "Dolo 650mg";
        document.getElementById("batchCode").value = "DL650IND";
        document.getElementById("expDate").value = "2027-04-15";
        scanStatus.innerText = "✅ Strip Scanned! Details auto-filled below.";
        speakAlert("Medicine strip scanned. Dolo 650 detected.");
    }, 1000);
});

// 4. Usage Note Logic
function getUsageNote(medName) {
    const text = medName.toLowerCase();
    if (text.includes("para") || text.includes("dolo")) {
        return "Usage: For fever & body pain. Take after food. Max 3-4 tablets in 24 hrs.";
    }
    if (text.includes("azithro") || text.includes("amoxi")) {
        return "Usage: Antibiotic. Complete the full prescribed course.";
    }
    if (text.includes("pan") || text.includes("omee")) {
        return "Usage: For acidity & gas. Best taken empty stomach in morning.";
    }
    return "Usage: Keep in cool dry place. Consult a doctor before taking.";
}

// 5. Expiry Calculation Logic
function checkExpiryStatus(expiryDateString) {
    const today = new Date();
    const expiryDate = new Date(expiryDateString);
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { type: "expired", label: "Expired (" + Math.abs(diffDays) + " days ago)" };
    }
    if (diffDays <= 30) {
        return { type: "warn", label: "Expiring in " + diffDays + " days" };
    }
    return { type: "safe", label: "Safe (" + diffDays + " days left)" };
}

// 6. Drug Interaction Checker (Do dawaiyon ka aapas me takrav check karna)
function checkDrugInteractions() {
    const alertBox = document.getElementById("interactionAlert");
    const names = medicineList.map(m => m.name.toLowerCase());

    const hasPara = names.some(n => n.includes("para"));
    const hasDolo = names.some(n => n.includes("dolo"));

    if (hasPara && hasDolo) {
        alertBox.classList.remove("hidden");
        alertBox.innerText = "⚠️ Interaction Warning: Both 'Paracetamol' and 'Dolo 650' contain Paracetamol. Do not take both together to avoid overdose!";
    } else {
        alertBox.classList.add("hidden");
    }
}

// 7. Render Dashboard
function showMedicines() {
    medContainer.innerHTML = "";
    let safeTotal = 0, warnTotal = 0, expTotal = 0;

    for (let i = 0; i < medicineList.length; i++) {
        const med = medicineList[i];
        const status = checkExpiryStatus(med.expiry);

        if (status.type === "safe") safeTotal++;
        else if (status.type === "warn") warnTotal++;
        else expTotal++;

        const batchMsg = med.batch.length >= 6 ? "Valid Batch" : "Short Batch Code";
        const note = getUsageNote(med.name);
        const voiceText = `${med.name}. Status is ${status.label}. Take ${med.timing}.`;

        const cardHTML = `
            <div class="med-card ${status.type}">
                <div class="card-header">
                    <strong>${med.name}</strong>
                    <span class="tag ${status.type}">${status.label}</span>
                </div>
                <p>Timing: ${med.timing} | Expiry: ${med.expiry}</p>
                <p style="font-size: 12px; color: #555; margin-top: 4px;">Batch: ${med.batch} (${batchMsg})</p>
                <div class="note-box">${note}</div>
                <div class="card-btns">
                    <button class="voice-btn" onclick="speakAlert('${voiceText}')">🔊 Listen Alert</button>
                    <button class="remove-btn" onclick="removeMedicine(${i})">Delete</button>
                </div>
            </div>
        `;
        medContainer.innerHTML += cardHTML;
    }

    document.getElementById("safeCount").innerText = safeTotal;
    document.getElementById("warnCount").innerText = warnTotal;
    document.getElementById("expCount").innerText = expTotal;

    checkDrugInteractions();
    localStorage.setItem("myMedicinesPro", JSON.stringify(medicineList));
}

// 8. Add Medicine Button
addBtn.addEventListener("click", function () {
    const name = document.getElementById("medName").value.trim();
    const batch = document.getElementById("batchCode").value.trim() || "N/A";
    const expiry = document.getElementById("expDate").value;
    const timing = document.getElementById("doseTime").value;

    if (name === "" || expiry === "") {
        alert("Please enter Medicine Name and Expiry Date.");
        return;
    }

    const status = checkExpiryStatus(expiry);
    if (status.type === "expired") {
        speakAlert("Warning! This medicine is already expired. Do not consume it.");
    } else {
        speakAlert(name + " added safely to your tracker.");
    }

    medicineList.unshift({ name, batch, expiry, timing });
    showMedicines();

    document.getElementById("medName").value = "";
    document.getElementById("batchCode").value = "";
});

function removeMedicine(index) {
    medicineList.splice(index, 1);
    showMedicines();
}

// 9. Emergency SOS & GPS
const sosBtn = document.getElementById("sosBtn");
const sosPopup = document.getElementById("sosPopup");
const closePopup = document.getElementById("closePopup");

sosBtn.addEventListener("click", function () {
    sosPopup.classList.remove("hidden");
    const gpsText = document.getElementById("gpsText");

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (pos) {
                gpsText.innerText = "Live GPS Coordinates: " + pos.coords.latitude.toFixed(4) + ", " + pos.coords.longitude.toFixed(4);
            },
            function () {
                gpsText.innerText = "Location permission blocked by browser.";
            }
        );
    }
});

closePopup.addEventListener("click", function () {
    sosPopup.classList.add("hidden");
});

showMedicines();