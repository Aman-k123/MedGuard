let medicineList = JSON.parse(localStorage.getItem("myMedicines")) || [
    {
        name: "Paracetamol 500mg",
        batch: "IND4582",
        expiry: "2027-08-20",
        timing: "After Meal"
    },
    {
        name: "Azithromycin 500mg",
        batch: "AZT9021",
        expiry: "2027-03-15",
        timing: "After Meal"
    },
    {
        name: "Pan-D Capsule",
        batch: "PAN7741",
        expiry: "2026-12-05",
        timing: "Before Breakfast"
    },
    {
        name: "Cetirizine 10mg",
        batch: "CET3310",
        expiry: "2027-11-10",
        timing: "At Night"
    },
    {
        name: "Amoxicillin 250mg",
        batch: "AMX1120",
        expiry: "2026-06-12",
        timing: "After Meal"
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

function getUsageNote(medName) {
    const text = medName.toLowerCase();

    if (text.includes("para") || text.includes("dolo")) {
        return "Usage Note: Used for fever and mild pain. Do not exceed recommended daily dose.";
    } 
    if (text.includes("azithro") || text.includes("amoxi")) {
        return "Usage Note: Antibiotic medicine. Complete the full course prescribed by your doctor.";
    } 
    if (text.includes("pan") || text.includes("omee")) {
        return "Usage Note: Used for acidity and gas relief. Usually taken before meals.";
    }
    return "Usage Note: Store in a cool, dry place and check doctor prescription before use.";
}

function checkExpiryStatus(expiryDateString) {
    const today = new Date();
    const expiryDate = new Date(expiryDateString);
    
    const timeDiff = expiryDate - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
        return { type: "expired", label: "Expired (" + Math.abs(daysLeft) + " days ago)" };
    } 
    if (daysLeft <= 30) {
        return { type: "warn", label: "Expiring in " + daysLeft + " days" };
    }
    return { type: "safe", label: "Safe (" + daysLeft + " days left)" };
}

function showMedicines() {
    medContainer.innerHTML = "";
    let safeTotal = 0;
    let warnTotal = 0;
    let expTotal = 0;

    for (let i = 0; i < medicineList.length; i++) {
        const med = medicineList[i];
        const status = checkExpiryStatus(med.expiry);

        if (status.type === "safe") safeTotal++;
        else if (status.type === "warn") warnTotal++;
        else expTotal++;

        const batchMsg = med.batch.length >= 6 ? "Valid Batch Format" : "Short/Unverified Batch";
        const note = getUsageNote(med.name);

        const cardHTML = `
            <div class="med-card ${status.type}">
                <div class="card-header">
                    <strong>${med.name}</strong>
                    <span class="tag ${status.type}">${status.label}</span>
                </div>
                <p>Timing: ${med.timing} | Expiry: ${med.expiry}</p>
                <p style="font-size: 12px; color: #555; margin-top: 4px;">Batch: ${med.batch} (${batchMsg})</p>
                <div class="note-box">${note}</div>
                <button class="remove-btn" onclick="removeMedicine(${i})">Delete</button>
            </div>
        `;
        medContainer.innerHTML += cardHTML;
    }

    document.getElementById("safeCount").innerText = safeTotal;
    document.getElementById("warnCount").innerText = warnTotal;
    document.getElementById("expCount").innerText = expTotal;

    localStorage.setItem("myMedicines", JSON.stringify(medicineList));
}

addBtn.addEventListener("click", function () {
    const name = document.getElementById("medName").value.trim();
    const batch = document.getElementById("batchCode").value.trim() || "N/A";
    const expiry = document.getElementById("expDate").value;
    const timing = document.getElementById("doseTime").value;

    if (name === "" || expiry === "") {
        alert("Please enter both Medicine Name and Expiry Date.");
        return;
    }

    medicineList.unshift({
        name: name,
        batch: batch,
        expiry: expiry,
        timing: timing
    });

    showMedicines();

    document.getElementById("medName").value = "";
    document.getElementById("batchCode").value = "";
});

function removeMedicine(index) {
    medicineList.splice(index, 1);
    showMedicines();
}

const sosBtn = document.getElementById("sosBtn");
const sosPopup = document.getElementById("sosPopup");
const closePopup = document.getElementById("closePopup");

sosBtn.addEventListener("click", function () {
    sosPopup.classList.remove("hidden");
    const gpsText = document.getElementById("gpsText");

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const lat = position.coords.latitude.toFixed(4);
                const lon = position.coords.longitude.toFixed(4);
                gpsText.innerText = "Your GPS Location: " + lat + ", " + lon;
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