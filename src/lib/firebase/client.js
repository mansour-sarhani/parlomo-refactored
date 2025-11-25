import { getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let firebaseApp;
if (typeof window !== "undefined") {
    const existingApps = getApps();
    firebaseApp = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
}

export const getMessagingInstance = () => {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        return getMessaging(firebaseApp);
    } catch (error) {
        console.error("Error getting Firebase messaging instance:", error);
        return null;
    }
};

export const requestNotificationPermission = async () => {
    try {
        if (!("Notification" in window)) {
            console.warn("This browser does not support notifications");
            return null;
        }

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            return null;
        }

        const messaging = getMessagingInstance();
        if (!messaging) {
            return null;
        }

        return await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
    } catch (error) {
        console.error("Error requesting notification permission:", error);
        return null;
    }
};

export const getCurrentToken = async () => {
    try {
        const messaging = getMessagingInstance();
        if (!messaging) {
            return null;
        }

        return await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
    } catch (error) {
        console.error("Error getting current FCM token:", error);
        return null;
    }
};

export const onForegroundMessage = (callback) => {
    const messaging = getMessagingInstance();
    if (!messaging) {
        return () => {};
    }

    return onMessage(messaging, (payload) => {
        callback(payload);
    });
};

export const isNotificationSupported = () =>
    typeof window !== "undefined" && "Notification" in window;

export const getNotificationPermission = () => {
    if (!isNotificationSupported()) {
        return null;
    }

    return Notification.permission;
};

export { firebaseApp };


