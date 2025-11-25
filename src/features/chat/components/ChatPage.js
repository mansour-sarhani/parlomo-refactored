"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AlignLeft, AtSign, Loader2, MessageSquarePlus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    deleteConversation,
    ensureUserHasPublicId,
    fetchContactByPublicId,
    fetchConversationMessages,
    fetchConversations,
    resetSearchResults,
    searchContactsByPublicId,
    selectChatState,
    sendMessage,
    setActiveConversationId,
    setContact,
} from "@/features/chat/chatSlice";
import { useChatRealtime } from "@/features/chat/hooks/useChatRealtime";
import { toast } from "sonner";
import Link from "next/link";
import { usePermissions } from "@/hooks/usePermissions";
import { hasRoleOrGroup } from "@/utils/permissions";

const FALLBACK_AVATAR = "/assets/images/user-avatar.svg";

const buildAvatarUrl = (user) => {
    if (!user) return FALLBACK_AVATAR;
    if (user.avatar?.startsWith("http")) return user.avatar;
    if (!user.avatar) return FALLBACK_AVATAR;

    const baseUrl =
        process.env.NEXT_PUBLIC_ASSET_BASE_URL ||
        process.env.NEXT_PUBLIC_URL_KEY ||
        "";

    const trimmedBase = baseUrl?.replace(/\/$/, "");
    const pathSegment = user.path ? `/${user.path.replace(/^\//, "")}` : "";
    const avatarSegment = `/${user.avatar.replace(/^\//, "")}`;

    if (!trimmedBase) {
        return `${pathSegment}${avatarSegment}`.replace(/^\/+/, "/");
    }

    return `${trimmedBase}${pathSegment}${avatarSegment}`;
};

const EmptyState = ({ title, description, action }) => (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
        <MessageSquarePlus className="w-16 h-16 text-[var(--color-border-muted)] mb-4" />
        <h3 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
            {title}
        </h3>
        <p className="mt-2 text-sm max-w-md" style={{ color: "var(--color-text-tertiary)" }}>
            {description}
        </p>
        {action && <div className="mt-6">{action}</div>}
    </div>
);

export const ChatPage = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const chat = useAppSelector(selectChatState);
    const { permissions, role } = usePermissions();

    const [composerValue, setComposerValue] = useState("");
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [conversationFilter, setConversationFilter] = useState("");
    const [newChatQuery, setNewChatQuery] = useState("");
    const hasCheckedPublicId = useRef(false);
    const scrollAnchorRef = useRef(null);

    const conversations = chat.conversations.items ?? [];
    const messages = chat.messages.items ?? [];
    const activeConversationId = chat.activeConversationId;
    const contact = chat.contact;

    // Check if user has admin access to view user profiles
    const canViewUserProfile = hasRoleOrGroup(role, permissions, "Admin");

    useChatRealtime(activeConversationId);

    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    useEffect(() => {
        if (hasCheckedPublicId.current) return;

        hasCheckedPublicId.current = true;

        dispatch(ensureUserHasPublicId())
            .unwrap()
            .then((result) => {
                if (result?.status === false) {
                    const message = result?.message || "Add a public ID before using chat.";
                    router.replace(
                        `/panel/profile?redirect=chat&message=${encodeURIComponent(message)}`
                    );
                }
            })
            .catch(() => {
                // Fail silently - toast handled by extraReducers
            });
    }, [dispatch, router]);

    useEffect(() => {
        const publicIdParam = searchParams?.get("publicId");
        if (publicIdParam) {
            const cleaned = publicIdParam.replace(/^@/, "");
            dispatch(fetchContactByPublicId(cleaned));
        }
    }, [dispatch, searchParams]);

    useEffect(() => {
        if (scrollAnchorRef.current) {
            scrollAnchorRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [messages]);

    const handleSelectConversation = (conversation) => {
        const conversationId = conversation?.thread?.conversation_id;
        const user = conversation?.withUser;

        if (!conversationId) return;

        dispatch(setActiveConversationId(conversationId));
        dispatch(
            setContact(
                user
                    ? {
                          name: user.name,
                          publicId: user.publicId,
                          avatar: user.avatar,
                          path: user.path,
                      }
                    : null
            )
        );
        dispatch(fetchConversationMessages(conversationId));
    };

    const handleSendMessage = async () => {
        if (!contact?.publicId || !composerValue.trim()) {
            return;
        }

        try {
            await dispatch(
                sendMessage({
                    publicId: contact.publicId,
                    message: composerValue.trim(),
                })
            ).unwrap();
            setComposerValue("");
        } catch (error) {
            toast.error(error || "Failed to send message");
        }
    };

    const handleDeleteConversation = async () => {
        if (!activeConversationId) return;

        try {
            await dispatch(deleteConversation(activeConversationId)).unwrap();
            toast.success("Conversation deleted");
            setComposerValue("");
        } catch (error) {
            toast.error(error || "Unable to delete conversation");
        }
    };

    const handleSearchSubmit = async (event) => {
        event.preventDefault();
        if (!newChatQuery.trim()) return;

        await dispatch(searchContactsByPublicId(newChatQuery.trim()));
    };

    const handleOpenChat = async (user) => {
        setIsNewChatOpen(false);
        setNewChatQuery("");
        dispatch(resetSearchResults());

        if (user?.publicId) {
            await dispatch(fetchContactByPublicId(user.publicId));
        }
    };

    const handleRefresh = () => {
        dispatch(fetchConversations());
        if (activeConversationId) {
            dispatch(fetchConversationMessages(activeConversationId));
        }
    };

    const newChatResults = chat.search.results ?? [];
    const isComposerDisabled = !contact?.publicId && !activeConversationId;

    return (
        <div className="flex h-full flex-col" style={{ color: "var(--color-text-primary)" }}>
            <div
                className="flex items-center justify-between border-b px-6 py-4"
                style={{ borderColor: "var(--color-border)" }}
            >
                <div>
                    <h1 className="text-2xl font-semibold">Messages</h1>
                    <p
                        className="mt-1 text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Chat with users and manage support conversations in real time.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                        style={{
                            border: "1px solid var(--color-border)",
                            color: "var(--color-text-secondary)",
                        }}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsNewChatOpen(true)}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all"
                        style={{
                            backgroundColor: "var(--color-primary)",
                            color: "#ffffff",
                        }}
                    >
                        <MessageSquarePlus className="h-4 w-4" />
                        New Chat
                    </button>
                </div>
            </div>

            <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
                <div
                    className="border-b px-4 py-3 lg:hidden"
                    style={{ borderColor: "var(--color-border)" }}
                >
                    <label className="text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                        Conversations
                    </label>
                    <select
                        value={activeConversationId ?? ""}
                        onChange={(event) => {
                            const selectedId = event.target.value;
                            const conversation = conversations.find(
                                (item) =>
                                    String(item.thread?.conversation_id) === String(selectedId)
                            );
                            if (conversation) {
                                handleSelectConversation(conversation);
                            }
                        }}
                        className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
                        style={{
                            borderColor: "var(--color-border)",
                            backgroundColor: "var(--color-background-secondary)",
                            color: "var(--color-text-primary)",
                        }}
                    >
                        <option value="">Select a conversation</option>
                        {conversations.map((conversation) => (
                            <option
                                key={conversation.thread?.conversation_id}
                                value={conversation.thread?.conversation_id}
                            >
                                {conversation.withUser?.name || conversation.withUser?.publicId || "Unknown"}
                            </option>
                        ))}
                    </select>
                </div>

                <div
                    className="hidden w-80 flex-shrink-0 flex-col border-r lg:flex"
                    style={{ borderColor: "var(--color-border)" }}
                >
                    <div className="px-4 py-3">
                        <div
                            className="flex items-center rounded-lg px-3 py-2"
                            style={{
                                backgroundColor: "var(--color-background-secondary)",
                                border: "1px solid var(--color-border)",
                            }}
                        >
                            <Search className="h-4 w-4" style={{ color: "var(--color-text-tertiary)" }} />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="ml-2 flex-1 bg-transparent text-sm outline-none"
                                style={{ color: "var(--color-text-primary)" }}
                                onChange={(event) => {
                                    const value = event.target.value.toLowerCase();
                                    setConversationFilter(value);
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {chat.conversations.loading ? (
                            <div className="flex justify-center py-6">
                                <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary)]" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <EmptyState
                                title="No conversations yet"
                                description="Start a new chat to send your first message."
                                action={
                                    <button
                                        onClick={() => setIsNewChatOpen(true)}
                                        className="rounded-lg px-4 py-2 text-sm font-medium transition-all"
                                        style={{
                                            backgroundColor: "var(--color-primary)",
                                            color: "#ffffff",
                                        }}
                                    >
                                        Start Chat
                                    </button>
                                }
                            />
                        ) : (
                            <ul className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                                {conversations
                                    .filter((item) => {
                                        if (!conversationFilter) return true;
                                        const name = item.withUser?.name?.toLowerCase() ?? "";
                                        const publicId = item.withUser?.publicId?.toLowerCase() ?? "";
                                        return (
                                            name.includes(conversationFilter) ||
                                            publicId.includes(conversationFilter)
                                        );
                                    })
                                    .map((conversation) => {
                                        const user = conversation.withUser;
                                        const thread = conversation.thread;
                                        const isActive =
                                            activeConversationId === thread?.conversation_id;
                                        const avatarUrl = buildAvatarUrl(user);

                                        return (
                                            <li key={thread?.conversation_id}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSelectConversation(conversation)}
                                                    className={`flex w-full gap-3 px-4 py-3 transition ${
                                                        isActive
                                                            ? "bg-[var(--color-background-secondary)]"
                                                            : "hover:bg-[var(--color-background-secondary)]"
                                                    }`}
                                                    style={{ textAlign: "left" }}
                                                >
                                                    <Image
                                                        src={avatarUrl}
                                                        alt={user?.name || "User"}
                                                        width={48}
                                                        height={48}
                                                        className="h-12 w-12 rounded-full object-cover"
                                                        unoptimized
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-semibold truncate">
                                                                    {user?.name || "Unknown user"}
                                                                </span>
                                                                {user?.publicId && (
                                                                    <span
                                                                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                                                                        style={{
                                                                            backgroundColor:
                                                                                "var(--color-background-tertiary)",
                                                                            color: "var(--color-text-tertiary)",
                                                                        }}
                                                                    >
                                                                        <AtSign className="h-3 w-3" />
                                                                        {user.publicId}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span
                                                                className="text-xs"
                                                                style={{ color: "var(--color-text-tertiary)" }}
                                                            >
                                                                {thread?.humans_time
                                                                    ? `${thread.humans_time} ago`
                                                                    : ""}
                                                            </span>
                                                        </div>
                                                        <p
                                                            className="mt-1 text-xs line-clamp-2"
                                                            style={{ color: "var(--color-text-secondary)" }}
                                                        >
                                                            {thread?.last_message || "No messages yet"}
                                                        </p>
                                                    </div>
                                                    {!thread?.owner &&
                                                        thread?.is_seen_receiver === 0 && (
                                                            <span
                                                                className="mt-2 inline-flex h-2 w-2 rounded-full"
                                                                style={{ backgroundColor: "var(--color-primary)" }}
                                                            />
                                                        )}
                                                </button>
                                            </li>
                                        );
                                    })}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="flex flex-1 flex-col">
                    {!contact && !activeConversationId ? (
                        <EmptyState
                            title="Select a conversation"
                            description="Choose a chat from the sidebar or start a new one."
                            action={
                                conversations.length > 0 ? (
                                    <button
                                        onClick={() => setIsNewChatOpen(true)}
                                        className="rounded-lg px-4 py-2 text-sm font-medium transition-all"
                                        style={{
                                            backgroundColor: "var(--color-primary)",
                                            color: "#ffffff",
                                        }}
                                    >
                                        Start chat
                                    </button>
                                ) : null
                            }
                        />
                    ) : (
                        <>
                            <div
                                className="flex items-center justify-between border-b px-6 py-4"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={buildAvatarUrl(contact)}
                                        alt={contact?.name || "User avatar"}
                                        width={48}
                                        height={48}
                                        className="h-12 w-12 rounded-full object-cover"
                                        unoptimized
                                    />
                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            {contact?.name || "Unknown user"}
                                        </h2>
                                        {contact?.publicId && (
                                            <div className="flex items-center gap-1 text-sm">
                                                <AtSign className="h-4 w-4" />
                                                <span>{contact.publicId}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {canViewUserProfile && (
                                        <Link
                                            href={`/panel/admin/users?publicName=${contact?.publicId ?? ""}`}
                                            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
                                            style={{
                                                borderColor: "var(--color-border)",
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            <AlignLeft className="h-4 w-4" />
                                            View profile
                                        </Link>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleDeleteConversation}
                                        disabled={!activeConversationId}
                                        className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-50"
                                        style={{
                                            borderColor: "var(--color-border)",
                                            color: "var(--color-error, #ef4444)",
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                                {chat.messages.loading ? (
                                    <div className="flex justify-center py-6">
                                        <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary)]" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <EmptyState
                                        title="No messages yet"
                                        description="Say hello to start the conversation."
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((message) => {
                                            const isOwner = message.owner;
                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${
                                                        isOwner ? "justify-end" : "justify-start"
                                                    }`}
                                                >
                                                    <div
                                                        className={`max-w-xl rounded-2xl px-4 py-3 text-sm shadow-sm`}
                                                        style={{
                                                            backgroundColor: isOwner
                                                                ? "var(--color-primary)"
                                                                : "var(--color-background-secondary)",
                                                            color: isOwner ? "#ffffff" : "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2 text-xs font-semibold">
                                                            <span>{message.sender?.name || "Unknown"}</span>
                                                            <span
                                                                style={{
                                                                    color: isOwner
                                                                        ? "rgba(255,255,255,0.7)"
                                                                        : "var(--color-text-tertiary)",
                                                                }}
                                                            >
                                                                {message.humans_time
                                                                    ? `${message.humans_time} ago`
                                                                    : ""}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 whitespace-pre-line leading-relaxed">
                                                            {message.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={scrollAnchorRef} />
                                    </div>
                                )}
                            </div>

                            <div
                                className="border-t px-6 py-4"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <div
                                    className="flex items-center rounded-2xl border px-4 py-3"
                                    style={{ borderColor: "var(--color-border)" }}
                                >
                                    <textarea
                                        rows={1}
                                        value={composerValue}
                                        placeholder={
                                            isComposerDisabled
                                                ? "Select a chat to start messaging"
                                                : "Type your message..."
                                        }
                                        disabled={isComposerDisabled}
                                        onChange={(event) => setComposerValue(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === "Enter" &&
                                                !event.shiftKey
                                            ) {
                                                event.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        className="flex-1 resize-none bg-transparent text-sm outline-none"
                                        style={{ color: "var(--color-text-primary)" }}
                                    />
                                    <button
                                        type="button"
                                        disabled={
                                            !composerValue.trim() ||
                                            chat.sendStatus === "loading" ||
                                            isComposerDisabled
                                        }
                                        onClick={handleSendMessage}
                                        className="ml-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50"
                                        style={{
                                            backgroundColor: "var(--color-primary)",
                                            color: "#ffffff",
                                        }}
                                    >
                                        {chat.sendStatus === "loading" ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <MessageSquarePlus className="h-4 w-4" />
                                        )}
                                        Send
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isNewChatOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur">
                    <div
                        className="w-full max-w-lg rounded-2xl border bg-[var(--color-background)] shadow-2xl"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-xl font-semibold">Start a new chat</h2>
                                <p
                                    className="text-sm mt-1"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    Search users by public ID to begin a conversation.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsNewChatOpen(false);
                                    setNewChatQuery("");
                                    dispatch(resetSearchResults());
                                }}
                                className="rounded-lg px-2 py-1 text-sm transition hover:bg-[var(--color-background-secondary)]"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={handleSearchSubmit} className="px-6 py-4 border-b">
                            <div
                                className="flex items-center rounded-lg border px-3 py-2"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <input
                                    type="text"
                                    value={newChatQuery}
                                    onChange={(event) => setNewChatQuery(event.target.value)}
                                    placeholder="Enter public ID (e.g. john-doe)"
                                    className="flex-1 bg-transparent text-sm outline-none"
                                    style={{ color: "var(--color-text-primary)" }}
                                />
                                <button
                                    type="submit"
                                    className="ml-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all"
                                    style={{
                                        backgroundColor: "var(--color-primary)",
                                        color: "#ffffff",
                                    }}
                                >
                                    <Search className="h-4 w-4" />
                                    Search
                                </button>
                            </div>
                            {chat.search.error && (
                                <p className="mt-2 text-sm text-red-500">{chat.search.error}</p>
                            )}
                        </form>

                        <div className="max-h-80 overflow-y-auto px-6 py-4 custom-scrollbar">
                            {chat.search.loading ? (
                                <div className="flex justify-center py-6">
                                    <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary)]" />
                                </div>
                            ) : newChatResults.length === 0 ? (
                                <p
                                    className="text-sm text-center py-6"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    No users found. Try a different public ID.
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {newChatResults.map((user) => (
                                        <li key={user.publicId}>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenChat(user)}
                                                className="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition hover:border-[var(--color-primary)]"
                                                style={{ borderColor: "var(--color-border)" }}
                                            >
                                                <Image
                                                    src={buildAvatarUrl(user)}
                                                    alt={user.publicId}
                                                    width={48}
                                                    height={48}
                                                    className="h-12 w-12 rounded-full object-cover"
                                                    unoptimized
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{user.name}</p>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <AtSign className="h-4 w-4" />
                                                        <span>{user.publicId}</span>
                                                    </div>
                                                </div>
                                                <MessageSquarePlus className="h-4 w-4 text-[var(--color-primary)]" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;


