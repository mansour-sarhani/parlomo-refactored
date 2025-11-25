"use client";

import { useEffect } from "react";

const isDebugEnabled = process.env.NEXT_PUBLIC_ENABLE_NOTIFICATION_DEBUG === "true";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const sendConfigToServiceWorker = async (registration) => {
    if (!registration) return;

    const activeWorker =
        registration.active ?? registration.waiting ?? registration.installing ?? null;

    if (!activeWorker) {
        return;
    }

    activeWorker.postMessage({
        type: "FIREBASE_CONFIG",
        config: firebaseConfig,
    });
};

export const FirebaseMessagingProvider = ({ children }) => {
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!("serviceWorker" in navigator)) {
            if (isDebugEnabled) {
                console.warn("Firebase messaging: service workers not supported in this browser");
            }
            return;
        }

        let isMounted = true;

        const registerServiceWorker = async () => {
            try {
                const registration = await navigator.serviceWorker.register(
                    "/firebase-messaging-sw.js",
                    {
                        scope: "/",
                    }
                );

                if (isMounted && isDebugEnabled) {
                    console.log("Firebase messaging service worker registered", registration);
                }

                await sendConfigToServiceWorker(registration);

                if (registration.installing) {
                    registration.installing.addEventListener("statechange", async (event) => {
                        if (event.target?.state === "activated") {
                            await sendConfigToServiceWorker(registration);
                        }
                    });
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Failed to register Firebase messaging service worker", error);
                }
            }
        };

        const ensureConfigPosted = async () => {
            try {
                const registration = await navigator.serviceWorker.ready;
                await sendConfigToServiceWorker(registration);
            } catch (error) {
                if (isDebugEnabled) {
                    console.warn("Firebase messaging: unable to post config to service worker", error);
                }
            }
        };

        registerServiceWorker();
        ensureConfigPosted();

        return () => {
            isMounted = false;
        };
    }, []);

    return children;
};

export default FirebaseMessagingProvider;


