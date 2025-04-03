
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Hide all existing error messages
            document.querySelectorAll(".text-danger").forEach(el => el.style.display = "none");
            const registerError = document.getElementById("registerError");
            if (registerError) registerError.style.display = "none";

            let hasError = false;

            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirm_password").value;


// Check if the username is empty
if (username === "") {
    document.getElementById("errorUsername").style.display = "block";
    hasError = true;
} else {
    // Hide the error message when the username is corrected
    document.getElementById("errorUsername").style.display = "none";
}

// Check if the email contains "@" and "."
if (!email.includes("@") || !email.includes(".")) {
    document.getElementById("errorEmail").style.display = "block";
    hasError = true;
} else {
    // Hide the error message when the email is corrected
    document.getElementById("errorEmail").style.display = "none";
}

// Check if the password matches the confirm password
if (password !== confirmPassword) {
    document.getElementById("passwordMismatch").style.display = "block";
    hasError = true;
} else {
    // Hide the password mismatch error when corrected
    document.getElementById("passwordMismatch").style.display = "none";
}

// If any error exists, stop further execution
if (hasError) return;

// Add event listeners to check if the user corrects the inputs
document.getElementById("username").addEventListener("input", function() {
    if (this.value !== "") {
        document.getElementById("errorUsername").style.display = "none";
    }
});

document.getElementById("email").addEventListener("input", function() {
    if (this.value.includes("@") && this.value.includes(".")) {
        document.getElementById("errorEmail").style.display = "none";
    }
});

document.getElementById("password").addEventListener("input", function() {
    if (this.value === document.getElementById("confirmPassword").value) {
        document.getElementById("passwordMismatch").style.display = "none";
    }
});

document.getElementById("confirm_password").addEventListener("input", function() {
    if (this.value === document.getElementById("password").value) {
        document.getElementById("passwordMismatch").style.display = "none";
    }
});

            if (hasError) return;

            const formData = new FormData(registerForm);
            const payload = {
                action: "register",
                username: formData.get("username"),
                display_name: formData.get("display_name"),
                email: formData.get("email"),
                password: formData.get("password"),
            };

            const res = await fetch("auth.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (result.message) {
                alert(result.message);
                window.location.href="index.html";
            } else if (result.error) {
                const errorBox = document.getElementById("registerError");
                if (errorBox) {
                    errorBox.textContent = result.error;
                    errorBox.style.display = "block";
                }
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const payload = {
                action: "login",
                username: formData.get("username"),
                password: formData.get("password"),
            };
            const res = await fetch("auth.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await res.json();
            if (result.message && result.message.includes("✅")) {
                if(result.display_name)
                    sessionStorage.setItem("displayName",result.display_name)
                window.location.href = "home.html";
            } else if (result.error) {
                const loginError = document.getElementById("loginError");
                if (loginError) {
                    loginError.textContent = result.error;
                    loginError.style.display = "block";
                }
            }
        });
    }
});
