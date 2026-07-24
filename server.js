const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();
const PORT = 3000;

/* Read JSON and form information sent from the browser */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Keep users signed in while using the app */
app.use(
    session({
        secret: "antos-ridego-local-project-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            sameSite: "lax"
        }
    })
);

/* Connect to SQLite database */
const db = new sqlite3.Database(path.join(__dirname, "ridego.db"), (error) => {
    if (error) {
        console.error("Database connection error:", error.message);
    } else {
        console.log("Connected to the RideGo database.");
    }
});

/* Create database tables */
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            pickup_location TEXT NOT NULL,
            destination TEXT NOT NULL,
            ride_type TEXT NOT NULL,
            fare INTEGER NOT NULL,
            booking_date TEXT NOT NULL,
            booking_time TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);
});

/* Blocks booking actions for users who are not signed in */
function requireLogin(request, response, next) {
    if (!request.session.userId) {
        return response.status(401).json({
            message: "Please sign in before booking a ride."
        });
    }

    next();
}

/* Create a new user account */
app.post("/api/signup", async (request, response) => {
    const { fullName, email, password } = request.body;

    if (!fullName || !email || !password) {
        return response.status(400).json({
            message: "Please complete all fields."
        });
    }

    if (password.length < 6) {
        return response.status(400).json({
            message: "Password must be at least 6 characters."
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
            `INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)`,
            [fullName.trim(), email.trim().toLowerCase(), hashedPassword],
            function (error) {
                if (error) {
                    if (error.code === "SQLITE_CONSTRAINT") {
                        return response.status(409).json({
                            message: "An account with this email already exists."
                        });
                    }

                    return response.status(500).json({
                        message: "Could not create your account."
                    });
                }

                response.status(201).json({
                    message: "Account created successfully. Please sign in."
                });
            }
        );
    } catch (error) {
        response.status(500).json({
            message: "Could not secure your password."
        });
    }
});

/* Sign in an existing user */
app.post("/api/signin", (request, response) => {
    const { email, password } = request.body;

    if (!email || !password) {
        return response.status(400).json({
            message: "Enter your email and password."
        });
    }

    db.get(
        `SELECT * FROM users WHERE email = ?`,
        [email.trim().toLowerCase()],
        async (error, user) => {
            if (error) {
                return response.status(500).json({
                    message: "Could not sign you in."
                });
            }

            if (!user) {
                return response.status(401).json({
                    message: "Incorrect email or password."
                });
            }

            const passwordMatches = await bcrypt.compare(password, user.password);

            if (!passwordMatches) {
                return response.status(401).json({
                    message: "Incorrect email or password."
                });
            }

            request.session.userId = user.id;
            request.session.userName = user.full_name;

            response.json({
                message: `Welcome back, ${user.full_name}!`
            });
        }
    );
});

/* Sign out */
app.post("/api/logout", (request, response) => {
    request.session.destroy(() => {
        response.json({
            message: "You have signed out."
        });
    });
});

/* Check whether a user is signed in */
app.get("/api/me", (request, response) => {
    if (!request.session.userId) {
        return response.status(401).json({
            message: "Not signed in."
        });
    }

    response.json({
        id: request.session.userId,
        name: request.session.userName
    });
});

/* Save a booking */
app.post("/api/bookings", requireLogin, (request, response) => {
    const { pickup, destination, rideType, date, time } = request.body;

    const fares = {
        Economy: 1500,
        Standard: 3500,
        Premium: 6000
    };

    const fare = fares[rideType];

    if (!pickup || !destination || !rideType || !date || !time || !fare) {
        return response.status(400).json({
            message: "Please complete all booking fields."
        });
    }

    db.run(
        `
            INSERT INTO bookings (
                user_id,
                pickup_location,
                destination,
                ride_type,
                fare,
                booking_date,
                booking_time
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            request.session.userId,
            pickup.trim(),
            destination.trim(),
            rideType,
            fare,
            date,
            time
        ],
        function (error) {
            if (error) {
                return response.status(500).json({
                    message: "Could not save your booking."
                });
            }

            response.status(201).json({
                message: "Ride booked successfully.",
                bookingId: this.lastID,
                fare: fare
            });
        }
    );
});

/* Get bookings belonging to the signed-in user */
app.get("/api/bookings", requireLogin, (request, response) => {
    db.all(
        `
            SELECT *
            FROM bookings
            WHERE user_id = ?
            ORDER BY created_at DESC
        `,
        [request.session.userId],
        (error, bookings) => {
            if (error) {
                return response.status(500).json({
                    message: "Could not load bookings."
                });
            }

            response.json(bookings);
        }
    );
});

/* Book a Ride button: sign in first if necessary */
app.get("/book", (request, response) => {
    if (request.session.userId) {
        return response.redirect("/booking.html");
    }

    response.redirect("/signin.html");
});

/* Serve HTML, CSS, and JavaScript files from the public folder */
app.use(express.static(path.join(__dirname, "public")));

/* Start server */
app.listen(PORT, () => {
    console.log(`Antos RideGo is running at http://localhost:${PORT}`);
});