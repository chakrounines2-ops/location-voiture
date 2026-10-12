/* ========================================
   1. CALCULATE THE RENTAL PRICE
======================================== */

function calculerPrix() {
    const voiture = document.getElementById("voiture");
    const dateDebut = document.getElementById("dateDebut");
    const dateFin = document.getElementById("dateFin");
    const prixTotal = document.getElementById("prixTotal");
    const message = document.getElementById("message");

    message.textContent = "";
    prixTotal.value = "";

    if (!voiture.value || !dateDebut.value || !dateFin.value) {
        message.textContent = "Veuillez remplir tous les champs de réservation.";
        return false;
    }

    const debut = new Date(dateDebut.value + "T00:00:00");
    const fin = new Date(dateFin.value + "T00:00:00");

    if (fin < debut) {
        message.textContent =
            "La date de fin doit être supérieure ou égale à la date de début.";
        return false;
    }

    let nombreJours = Math.round((fin - debut) / (1000 * 60 * 60 * 24));

    // Une réservation le même jour compte pour une journée.
    if (nombreJours === 0) {
        nombreJours = 1;
    }

    const prixJournalier = Number(voiture.value);

    if (!Number.isFinite(prixJournalier) || prixJournalier <= 0) {
        message.textContent = "Veuillez sélectionner un véhicule valide.";
        return false;
    }

    const total = nombreJours * prixJournalier;

    prixTotal.value = total.toFixed(2) + " DT";
    return true;
}


/* ========================================
   2. PRINT THE QUOTE (DEVIS)
======================================== */

function imprimerDevis() {
    const form = document.getElementById("reservationForm");

    // Make sure every required field is filled
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Calculate the price (shows its own error message if something is wrong)
    if (!calculerPrix()) return;

    const voiture = document.getElementById("voiture");
    const categorie = document.getElementById("categorie");

    const debut = new Date(document.getElementById("dateDebut").value + "T00:00:00");
    const fin = new Date(document.getElementById("dateFin").value + "T00:00:00");

    let jours = Math.round((fin - debut) / (1000 * 60 * 60 * 24));
    if (jours === 0) jours = 1;

    const formatDate = d => d.toLocaleDateString("fr-FR");

    const set = (id, texte) => {
        document.getElementById(id).textContent = texte;
    };

    set("dvDate", formatDate(new Date()));
    set("dvNom", document.getElementById("prenom").value + " " + document.getElementById("nom").value);
    set("dvEmail", document.getElementById("email").value);
    set("dvTel", document.getElementById("telephone").value);
    set("dvCategorie", categorie.options[categorie.selectedIndex].text);
    set("dvVoiture", voiture.options[voiture.selectedIndex].text);
    set("dvDebut", formatDate(debut));
    set("dvFin", formatDate(fin));
    set("dvJours", jours);
    set("dvPrixJour", voiture.value + " DT");
    set("dvTotal", document.getElementById("prixTotal").value);

    window.print();
}


/* ========================================
   3. LOAD VEHICLES FROM THE CSV FILE
======================================== */

async function chargerVehicules() {
    const tbody = document.getElementById("listeVehicules");

    try {
        const response = await fetch("data/vehicule.csv");

        if (!response.ok) {
            throw new Error("Impossible de charger vehicule.csv");
        }

        const csv = await response.text();

        // Convert CSV text into rows and columns.
        const lignes = csv.trim().split(/\r?\n/);
        const colonnes = lignes[0].split(",").map(c => c.trim());

        const indexCategorie = colonnes.indexOf("categorie");
        const indexMarque = colonnes.indexOf("marque");
        const indexModele = colonnes.indexOf("modele");
        const indexPuissance = colonnes.indexOf("puissance");
        const indexPrix = colonnes.indexOf("prix_jour");

        if ([indexCategorie, indexMarque, indexModele, indexPuissance, indexPrix].includes(-1)) {
            throw new Error("Les colonnes du CSV ne correspondent pas aux colonnes attendues.");
        }

        // Add each vehicle to the HTML table.
        tbody.innerHTML = "";

        lignes.slice(1).forEach(ligne => {
            if (!ligne.trim()) return;

            const valeurs = ligne.split(",").map(v => v.trim());

            const categorie = valeurs[indexCategorie];
            const marque = valeurs[indexMarque];
            const modele = valeurs[indexModele];
            const puissance = valeurs[indexPuissance];
            const prix = valeurs[indexPrix];

            const tr = document.createElement("tr");

            [categorie, `${marque} ${modele}`, `${puissance} CV`, `${prix} DT`]
                .forEach(texte => {
                    const td = document.createElement("td");
                    td.textContent = texte;
                    tr.appendChild(td);
                });

            tbody.appendChild(tr);
        });

        // Initialize DataTables once, after loading the CSV.
        if (!$.fn.DataTable.isDataTable("#tableVehicules")) {
            $("#tableVehicules").DataTable({
                pageLength: 10,
                ordering: true,
                language: {
                    search: "Rechercher :",
                    searchPlaceholder: "Nom ou catégorie...",
                    lengthMenu: "Afficher _MENU_ véhicules",
                    info: "Affichage de _START_ à _END_ sur _TOTAL_ véhicules",
                    infoEmpty: "Aucun véhicule disponible",
                    infoFiltered: "(filtré parmi _MAX_ véhicules)",
                    zeroRecords: "Aucun véhicule trouvé",
                    paginate: {
                        first: "Premier",
                        last: "Dernier",
                        next: "Suivant",
                        previous: "Précédent"
                    }
                }
            });
        }

    } catch (erreur) {
        console.error("Erreur lors du chargement des véhicules :", erreur);
        tbody.innerHTML =
            '<tr><td colspan="4">Impossible de charger les véhicules. Vérifiez le fichier CSV et relancez le site avec Live Server.</td></tr>';
    }
}


/* ========================================
   4. INITIALIZE THE PAGE FEATURES
======================================== */

$(document).ready(function () {

    // Load the catalogue (CSV + DataTables)
    chargerVehicules();

    // Select2: activate it only if the library is loaded.
    if ($.fn.select2) {
        $(".select2").select2({
            placeholder: "Choisir une option",
            allowClear: true,
            width: "100%"
        });
    }

    // Check the name when the user leaves the field.
    $("#nom").on("change", function () {
        const nom = $(this).val().trim();

        if (nom.length > 0 && nom.length < 3) {
            alert("Le nom doit contenir au moins 3 caractères.");
        }
    });

    // Reservation form validation.
    $("#reservationForm").on("submit", function (event) {
        event.preventDefault();

        const nom = $("#nom").val().trim();
        const prenom = $("#prenom").val().trim();
        const email = $("#email").val().trim();
        const telephone = $("#telephone").val().trim();
        const categorie = $("#categorie").val();
        const voiture = $("#voiture").val();
        const dateDebut = $("#dateDebut").val();
        const dateFin = $("#dateFin").val();
        const message = $("#message");

        message.removeClass("text-success").addClass("text-danger");
        message.text("");

        if (nom.length < 3) {
            message.text("Veuillez saisir un nom d'au moins 3 caractères.");
            return;
        }

        if (prenom.length === 0) {
            message.text("Veuillez saisir votre prénom.");
            return;
        }

        if (email === "") {
            message.text("Veuillez saisir votre email.");
            return;
        }

        if (!$("#email")[0].checkValidity()) {
            message.text("Veuillez saisir une adresse email valide.");
            return;
        }

        if (telephone === "") {
            message.text("Veuillez saisir votre téléphone.");
            return;
        }

        if (categorie === "") {
            message.text("Veuillez sélectionner une catégorie.");
            return;
        }

        if (voiture === "") {
            message.text("Veuillez sélectionner un véhicule.");
            return;
        }

        if (dateDebut === "" || dateFin === "") {
            message.text("Veuillez sélectionner les dates de réservation.");
            return;
        }

        if (new Date(dateFin + "T00:00:00") < new Date(dateDebut + "T00:00:00")) {
            message.text("La date de fin ne peut pas précéder la date de début.");
            return;
        }

        if (!calculerPrix()) {
            return;
        }

        message.removeClass("text-danger").addClass("text-success");
        message.text("Réservation validée avec succès.");
    });

});