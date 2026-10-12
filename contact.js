
const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const nom = document.getElementById("contactNom");
    const email = document.getElementById("contactEmail");
    const sujet = document.getElementById("contactSujet");
    const message = document.getElementById("contactMessage");
    const feedback = document.getElementById("contactFeedback");

    // Remove previous validation styles.
    [nom, email, sujet, message].forEach(function (champ) {
        champ.classList.remove("is-invalid", "is-valid");
    });

    feedback.textContent = "";
    feedback.className = "mt-3 mb-0";

    let formulaireValide = true;

    // Validate name.
    if (nom.value.trim().length < 3) {
        nom.classList.add("is-invalid");
        formulaireValide = false;
    } else {
        nom.classList.add("is-valid");
    }

    // Validate email.
    if (email.value.trim() === "" || !email.checkValidity()) {
        email.classList.add("is-invalid");
        formulaireValide = false;
    } else {
        email.classList.add("is-valid");
    }

    // Validate subject.
    if (sujet.value === "") {
        sujet.classList.add("is-invalid");
        formulaireValide = false;
    } else {
        sujet.classList.add("is-valid");
    }

    // Validate message.
    if (message.value.trim().length < 10) {
        message.classList.add("is-invalid");
        formulaireValide = false;
    } else {
        message.classList.add("is-valid");
    }

    if (!formulaireValide) {
        feedback.textContent =
            "Veuillez corriger les champs indiqués.";
        feedback.classList.add("text-danger");
        return;
    }

    feedback.textContent =
        "Formulaire validé avec succès !";
    feedback.classList.add("text-success");

    // This is a demonstration: no message is actually sent.
    contactForm.reset();

    [nom, email, sujet, message].forEach(function (champ) {
        champ.classList.remove("is-valid", "is-invalid");
    });
});
