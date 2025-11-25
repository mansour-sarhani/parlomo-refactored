"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchUsers, setFilters, setPage } from "@/features/users/usersSlice";
import { Table, TableHeader, TableHeaderCell, TableRow, TableCell } from "@/components/tables";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { Skeleton } from "@/components/common/Skeleton";
import { Pagination } from "@/components/common/Pagination";
import { Avatar } from "@/components/common/Avatar";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Users, Search, RefreshCcw, Pencil, Shield } from "lucide-react";

const buildAvatarUrl = (user) => {
    if (!user?.avatar) return null;

    const base = process.env.NEXT_PUBLIC_URL_KEY || "";
    const path = user.path ? `${user.path}${user.path.endsWith("/") ? "" : "/"}` : "";

    return `${base}${path}${user.avatar}`;
};

const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
};

const getRoleBadgeVariant = (role) => {
    switch ((role || "").toLowerCase()) {
        case "super-admin":
        case "admin":
            return "primary";
        case "system-admin":
        case "manager":
            return "info";
        default:
            return "neutral";
    }
};

export default function UsersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();

    const {
        list: users,
        loading,
        error,
        pagination,
        filters,
    } = useAppSelector((state) => state.users);

    const [formValues, setFormValues] = useState({
        name: filters.name,
        username: filters.username,
        publicName: filters.publicName,
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showReloadNotice, setShowReloadNotice] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState({ open: false, src: null, alt: "" });
    const tableRef = useRef(null);

    const memoisedLimit = useMemo(() => pagination.limit || 10, [pagination.limit]);

    const updateUrl = useCallback(
        (params) => {
            const url = new URL(window.location.href);

            Object.entries(params).forEach(([key, value]) => {
                if (value && value !== "") {
                    url.searchParams.set(key, value);
                } else {
                    url.searchParams.delete(key);
                }
            });

            if (url.searchParams.get("page") === "1") {
                url.searchParams.delete("page");
            }

            router.push(`${url.pathname}${url.search}`, { scroll: false });
        },
        [router]
    );

    useEffect(() => {
        let page = parseInt(searchParams.get("page") || "1", 10);
        if (Number.isNaN(page) || page < 1) {
            page = 1;
        }

        const name = searchParams.get("name") || "";
        const username = searchParams.get("username") || "";
        const publicName = searchParams.get("publicName") || "";

        setFormValues((prev) => {
            if (
                prev.name === name &&
                prev.username === username &&
                prev.publicName === publicName
            ) {
                return prev;
            }

            return {
                name,
                username,
                publicName,
            };
        });

        dispatch(setPage(page));
        dispatch(
            setFilters({
                name,
                username,
                publicName,
            })
        );

        dispatch(
            fetchUsers({
                page,
                limit: 10,
                name: name || undefined,
                username: username || undefined,
                publicName: publicName || undefined,
            })
        );
    }, [searchParams, dispatch]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        updateUrl({
            page: 1,
            name: formValues.name,
            username: formValues.username,
            publicName: formValues.publicName,
        });
    };

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await dispatch(
                fetchUsers({
                    page: pagination.page || 1,
                    limit: memoisedLimit,
                    name: filters.name || undefined,
                    username: filters.username || undefined,
                    publicName: filters.publicName || undefined,
                })
            ).unwrap();

            setShowReloadNotice(true);
            setTimeout(() => setShowReloadNotice(false), 5000);
        } catch (error) {
            // Errors are surfaced through the slice/toasts; no-op here.
        } finally {
            setIsRefreshing(false);
        }
    }, [
        dispatch,
        filters.name,
        filters.username,
        filters.publicName,
        memoisedLimit,
        pagination.page,
    ]);

    const handlePageChange = useCallback(
        (newPage) => {
            updateUrl({
                page: newPage,
                name: filters.name,
                username: filters.username,
                publicName: filters.publicName,
            });

            if (tableRef.current) {
                tableRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        },
        [filters.name, filters.username, filters.publicName, updateUrl]
    );

    const handleAvatarClick = (user) => {
        const src = buildAvatarUrl(user);
        setAvatarPreview({
            open: true,
            src,
            alt: user?.name || user?.username || "User avatar",
        });
    };

    const closeAvatarPreview = () => {
        setAvatarPreview({ open: false, src: null, alt: "" });
    };

    const renderStatusIndicator = (isBan) => {
        const isBanned = isBan === true || isBan === "1" || isBan === 1;
        const label = isBanned ? "Banned" : "Active";
        const color = isBanned ? "bg-[var(--color-error)]" : "bg-[var(--color-success)]";

        return (
            <div className="flex items-center gap-2 justify-center">
                <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
            </div>
        );
    };

    const totalUsers = pagination.total || 0;

    return (
        <ContentWrapper>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        All Users ({totalUsers})
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Manage users pulled from the legacy admin service
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {showReloadNotice && (
                        <span className="text-sm" style={{ color: "var(--color-success)" }}>
                            List reloaded!
                        </span>
                    )}
                    <Button
                        variant="secondary"
                        icon={<RefreshCcw size={16} />}
                        onClick={handleRefresh}
                        loading={isRefreshing}
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            <Card className="mb-6">
                <form
                    onSubmit={handleSearchSubmit}
                    className="grid grid-cols-1 md:grid-cols-5 gap-4"
                >
                    <div className="md:col-span-2">
                        <label
                            className="text-sm font-medium block mb-2"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Name
                        </label>
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2"
                                style={{ color: "var(--color-text-secondary)" }}
                            />
                            <input
                                name="name"
                                value={formValues.name}
                                onChange={handleInputChange}
                                placeholder="Search by full name"
                                className="w-full pl-10 pr-4 py-2 rounded-lg border"
                                style={{
                                    borderColor: "var(--color-border)",
                                    backgroundColor: "var(--color-background)",
                                    color: "var(--color-text-primary)",
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <label
                            className="text-sm font-medium block mb-2"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Username
                        </label>
                        <input
                            name="username"
                            value={formValues.username}
                            onChange={handleInputChange}
                            placeholder="Search by username"
                            className="w-full px-4 py-2 rounded-lg border"
                            style={{
                                borderColor: "var(--color-border)",
                                backgroundColor: "var(--color-background)",
                                color: "var(--color-text-primary)",
                            }}
                        />
                    </div>
                    <div>
                        <label
                            className="text-sm font-medium block mb-2"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Public ID
                        </label>
                        <input
                            name="publicName"
                            value={formValues.publicName}
                            onChange={handleInputChange}
                            placeholder="Search by public ID"
                            className="w-full px-4 py-2 rounded-lg border"
                            style={{
                                borderColor: "var(--color-border)",
                                backgroundColor: "var(--color-background)",
                                color: "var(--color-text-primary)",
                            }}
                        />
                    </div>
                    <div className="flex items-end justify-end gap-3">
                        <Button type="submit" className="w-full md:w-auto">
                            Search
                        </Button>
                    </div>
                </form>
            </Card>

            <Card>
                <div ref={tableRef}>
                    {loading ? (
                        <Skeleton type="table" rows={10} />
                    ) : error ? (
                        <div className="space-y-4 py-12 text-center">
                            <p style={{ color: "var(--color-error)" }}>{error}</p>
                            <Button onClick={handleRefresh}>Try Again</Button>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <Users
                                size={48}
                                style={{ color: "var(--color-text-secondary)", margin: "0 auto" }}
                            />
                            <p className="mt-4" style={{ color: "var(--color-text-secondary)" }}>
                                No users found
                            </p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHeaderCell key="avatar">Avatar</TableHeaderCell>
                                        <TableHeaderCell key="username">Username</TableHeaderCell>
                                        <TableHeaderCell key="name">Name</TableHeaderCell>
                                        <TableHeaderCell key="role">Role</TableHeaderCell>
                                        <TableHeaderCell key="publicId">Public ID</TableHeaderCell>
                                        <TableHeaderCell key="createdAt">
                                            Register Time
                                        </TableHeaderCell>
                                        <TableHeaderCell key="registerType">
                                            Register Type
                                        </TableHeaderCell>
                                        <TableHeaderCell key="actions">Actions</TableHeaderCell>
                                        <TableHeaderCell key="status">Status</TableHeaderCell>
                                    </TableRow>
                                </TableHeader>
                                <tbody>
                                    {users.map((user) => {
                                        const userId = user?.id ?? user?._id;
                                        const avatarUrl = buildAvatarUrl(user);
                                        const registerType =
                                            user?.registerType || user?.register_type || "-";

                                        return (
                                            <TableRow key={userId || user?.username}>
                                                <TableCell>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAvatarClick(user)}
                                                        className="flex items-center justify-center"
                                                    >
                                                        <Avatar
                                                            src={avatarUrl}
                                                            alt={user?.name}
                                                            size="sm"
                                                        />
                                                    </button>
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className="text-sm font-medium"
                                                        style={{
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        {user?.username || "-"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        {user?.name || "-"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={getRoleBadgeVariant(user?.role)}
                                                    >
                                                        {user?.role || "-"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        {user?.publicId || user?.public_id || "-"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        {formatDateTime(
                                                            user?.createdAt || user?.created_at
                                                        )}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        {registerType || "-"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            icon={<Pencil size={16} />}
                                                            onClick={() => {
                                                                if (!userId) return;
                                                                const query = new URLSearchParams();
                                                                if (user?.username) {
                                                                    query.set(
                                                                        "username",
                                                                        user.username
                                                                    );
                                                                }
                                                                router.push(
                                                                    query.toString()
                                                                        ? `/panel/admin/users/${userId}/edit?${query.toString()}`
                                                                        : `/panel/admin/users/${userId}/edit`
                                                                );
                                                            }}
                                                            disabled={!userId}
                                                        >
                                                            Edit User
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            icon={<Shield size={16} />}
                                                            onClick={() => {
                                                                if (!userId) return;
                                                                const query = new URLSearchParams();
                                                                if (user?.username) {
                                                                    query.set(
                                                                        "username",
                                                                        user.username
                                                                    );
                                                                }
                                                                query.set("section", "permissions");
                                                                router.push(
                                                                    `/panel/admin/users/${userId}/edit?${query.toString()}`
                                                                );
                                                            }}
                                                            disabled={!userId}
                                                        >
                                                            Permissions
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {renderStatusIndicator(user?.isBan)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </tbody>
                            </Table>

                            <div className="mt-6">
                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={pagination.pages}
                                    onPageChange={handlePageChange}
                                    totalItems={pagination.total}
                                    itemsPerPage={memoisedLimit}
                                />
                            </div>
                        </>
                    )}
                </div>
            </Card>

            <Modal
                isOpen={avatarPreview.open}
                onClose={closeAvatarPreview}
                title="User Avatar"
                size="sm"
            >
                <div className="flex items-center justify-center">
                    {avatarPreview.src ? (
                        <img
                            src={avatarPreview.src}
                            alt={avatarPreview.alt}
                            className="max-h-96 rounded-lg"
                        />
                    ) : (
                        <div
                            className="text-center text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            No avatar available
                        </div>
                    )}
                </div>
            </Modal>
        </ContentWrapper>
    );
}
