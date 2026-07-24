function showMessage(elementId, message, color) {
    const messageBox = document.getElementById(elementId);

    if (messageBox) {
        messageBox.textContent = message;
        messageBox.style.color = color;
    }
}

/* Sign-up page */

const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            showMessage("formMessage", "Passwords do not match.", "red");
            return;
        }

        showMessage("formMessage", "Creating your account...", "blue");

        try {
            const response = await fetch("/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullName,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage("formMessage", data.message, "red");
                return;
            }

            showMessage("formMessage", data.message, "green");
            signupForm.reset();

            setTimeout(() => {
                window.location.href = "signin.html";
            }, 1500);

        } catch (error) {
            showMessage("formMessage", "Could not connect to the server.", "red");
        }
    });
}

/* Sign-in page */

const signinForm = document.getElementById("signinForm");

if (signinForm) {
    signinForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("signinEmail").value.trim();
        const password = document.getElementById("signinPassword").value;

        showMessage("formMessage", "Signing you in...", "blue");

        try {
            const response = await fetch("/api/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage("formMessage", data.message, "red");
                return;
            }

            showMessage("formMessage", data.message, "green");

            setTimeout(() => {
                window.location.href = "booking.html";
            }, 1000);

        } catch (error) {
            showMessage("formMessage", "Could not connect to the server.", "red");
        }
    });
}

/* Booking page */

const fares = {
    Economy: 1500,
    Standard: 3500,
    Premium: 6000
};

const rideType = document.getElementById("rideType");
const fareEstimate = document.getElementById("fareEstimate");

if (rideType && fareEstimate) {
    rideType.addEventListener("change", function () {
        const fare = fares[rideType.value] || 0;
        fareEstimate.textContent = `₦${fare.toLocaleString()}`;
    });
}

const bookingForm = document.getElementById("bookingForm");

if (bookingForm) {
    bookingForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const pickup = document.getElementById("pickup").value.trim();
        const destination = document.getElementById("destination").value.trim();
        const date = document.getElementById("date").value;
        const time = document.getElementById("time").value;

        try {
            const response = await fetch("/api/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    pickup,
                    destination,
                    rideType: rideType.value,
                    date,
                    time
                })
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage("bookingMessage", data.message, "red");
                return;
            }

            showMessage(
                "bookingMessage",
                `Booking confirmed! Your estimated fare is ₦${data.fare.toLocaleString()}.`,
                "green"
            );

            bookingForm.reset();
            fareEstimate.textContent = "₦0";

        } catch (error) {
            showMessage("bookingMessage", "Could not connect to the server.", "red");
        }
    });
}

/* Sign out button */

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", async function () {
        await fetch("/api/logout", {
            method: "POST"
        });

        window.location.href = "index.html";
    });
}

if (window.location.pathname.endsWith("/booking.html")) {
    fetch("/api/me")
        .then((response) => {
            if (!response.ok) {
                window.location.href = "signin.html";
            }
        })
        .catch(() => {
            window.location.href = "signin.html";
        });
}

const bookRideButton = document.getElementById("bookRideButton");

if (bookRideButton) {
    bookRideButton.addEventListener("click", function (event) {
        event.preventDefault();

        fetch("/api/me")
            .then((response) => {
                if (response.ok) {
                    window.location.href = "booking.html";
                } else {
                    window.location.href = "signin.html";
                }
            })
            .catch(() => {
                window.location.href = "signin.html";
            });
    });
}