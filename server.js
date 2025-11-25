const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const port = parseInt(process.env.PORT, 10) || 3000;
const corsOrigin = process.env.CORS_ORIGIN || `https://localhost:${port}`;

const certDir = __dirname;
let httpsOptions;

try {
    httpsOptions = {
        key: fs.readFileSync(path.join(certDir, "key.pem")),
        cert: fs.readFileSync(path.join(certDir, "cert.pem")),
    };
} catch (error) {
    console.error("Failed to load TLS credentials from directory:", certDir);
    console.error(error.message);
    process.exit(1);
}

app.prepare()
    .then(() => {
        const server = express();

        server.use((req, res, nextFn) => {
            res.header("Access-Control-Allow-Origin", corsOrigin);
            res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
            res.header(
                "Access-Control-Allow-Headers",
                "Origin, X-Requested-With, Content-Type, Accept, Authorization"
            );
            res.header("Access-Control-Allow-Credentials", "true");

            if (req.method === "OPTIONS") {
                res.sendStatus(204);
                return;
            }

            nextFn();
        });

        server.use((req, res) => handle(req, res));

        https.createServer(httpsOptions, server).listen(port, (err) => {
            if (err) {
                console.error("HTTPS server failed to start:", err);
                process.exit(1);
            }

            console.log(`> Ready on https://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error("Next.js failed to prepare the app:", err);
        process.exit(1);
    });
