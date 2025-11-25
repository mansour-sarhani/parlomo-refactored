"use client";

import { useEffect } from "react";
import { onForegroundMessage } from "@/lib/firebase/client";
import { useAppDispatch } from "@/lib/hooks";
import { fetchConversationMessages, fetchConversations, appendIncomingMessage } from "../chatSlice";

const CHAT_FOREGROUND_EVENT = "chat:new-message";

/**
 * Hook that wires Firebase Cloud Messaging foreground events to Redux updates.
 * Falls back to periodic polling when FCM is not available.
 */
export const useChatRealtime = (activeConversationId) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const unsubscribe = onForegroundMessage((payload) => {
            const eventType = payload?.data?.eventType || payload?.data?.type;

            if (eventType !== CHAT_FOREGROUND_EVENT) {
                return;
            }

            const conversationId = payload?.data?.conversationId;
            let message = null;
            if (payload?.data?.message) {
                try {
                    message = JSON.parse(payload.data.message);
                } catch (error) {
                    if (process.env.NEXT_PUBLIC_ENABLE_NOTIFICATION_DEBUG === "true") {
                        console.error("Failed to parse chat message payload", error);
                    }
                }
            }

            if (conversationId) {
                dispatch(fetchConversations());

                if (activeConversationId === conversationId) {
                    if (message) {
                        dispatch(appendIncomingMessage(message));
                    } else {
                        dispatch(fetchConversationMessages(conversationId));
                    }
                }
            }
        });

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [dispatch, activeConversationId]);

    useEffect(() => {
        // Fallback polling every 30 seconds to keep data fresh.
        const interval = setInterval(() => {
            dispatch(fetchConversations());
            if (activeConversationId) {
                dispatch(fetchConversationMessages(activeConversationId));
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [dispatch, activeConversationId]);
};


