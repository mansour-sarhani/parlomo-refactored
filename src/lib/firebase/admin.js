import admin from "firebase-admin";

let firebaseAdmin = null;

export const getFirebaseAdmin = () => {
    if (firebaseAdmin) {
        return firebaseAdmin;
    }

    if (admin.apps.length > 0) {
        firebaseAdmin = admin.apps[0];
        return firebaseAdmin;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        console.error("Missing Firebase Admin credentials");
        return null;
    }

    firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
        projectId,
    });

    return firebaseAdmin;
};

export const getMessaging = () => {
    const app = getFirebaseAdmin();
    if (!app) {
        return null;
    }
    return admin.messaging(app);
};

export const sendPushNotification = async (token, { title, body, data = {} }) => {
    const messaging = getMessaging();
    if (!messaging) {
        throw new Error("Firebase Messaging not initialized");
    }

    const message = {
        token,
        notification: {
            title,
            body,
        },
        data: {
            ...data,
            clickAction: data.actionUrl || "/notifications",
        },
        webpush: {
            fcmOptions: {
                link: data.actionUrl || "/notifications",
            },
        },
    };

    return messaging.send(message);
};

export const sendBatchPushNotifications = async (tokens, payload) => {
    const messaging = getMessaging();
    if (!messaging) {
        throw new Error("Firebase Messaging not initialized");
    }

    if (!tokens || tokens.length === 0) {
        return {
            successCount: 0,
            failureCount: 0,
            responses: [],
        };
    }

    const message = {
        notification: {
            title: payload.title,
            body: payload.body,
        },
        data: {
            ...payload.data,
            clickAction: payload.data?.actionUrl || "/notifications",
        },
        webpush: {
            fcmOptions: {
                link: payload.data?.actionUrl || "/notifications",
            },
        },
        tokens,
    };

    return messaging.sendEachForMulticast(message);
};

export default admin;


