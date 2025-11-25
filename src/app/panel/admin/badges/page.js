"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, RefreshCcw } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { SkeletonTable } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import {
    AdminBadgeTable,
    AdminBadgeCreateModal,
    AdminBadgeEditModal,
} from "@/features/adminBadges";
import {
    fetchAdminBadges,
    setPage,
} from "@/features/adminBadges/adminBadgesSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useAuth } from "@/contexts/AuthContext";

const BADGE_PERMISSION_GROUP = "Badge Package";

const hasPermission = (permissionGroups, permissionName) => {
    if (!Array.isArray(permissionGroups)) {
        return false;
    }

    const group = permissionGroups.find(
        (item) => item.groupName === BADGE_PERMISSION_GROUP
    );

    if (!group) {
        return false;
    }

    return group.permissions?.some(
        (permission) => permission.name === permissionName
    );
};

export default function AdminBadgePackagesPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { authData } = useAuth();

    const {
        list: badges,
        loading,
        error,
        pagination,
    } = useAppSelector((state) => state.adminBadges);

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [editBadgeId, setEditBadgeId] = useState(null);
    const [showReloadNotice, setShowReloadNotice] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const memoisedLimit = useMemo(() => pagination.limit || 10, [pagination.limit]);

    const role =
        authData?.role ||
        authData?.user?.role ||
        authData?.user?.user_role ||
        "";
    const permissionGroups =
        authData?.permissions ||
        authData?.user?.permissions ||
        authData?.user?.permissionGroups;

    const canManageBadges =
        role === "super-admin" ||
        role === "admin" ||
        hasPermission(permissionGroups, "Admin create BadgePackage") ||
        hasPermission(permissionGroups, "Admin edit BadgePackage");

    const canCreate =
        role === "super-admin" ||
        hasPermission(permissionGroups, "Admin create BadgePackage");

    const canEdit =
        role === "super-admin" ||
        hasPermission(permissionGroups, "Admin edit BadgePackage");

    const updateUrl = useCallback(
        (params) => {
            const url = new URL(window.location.href);

            Object.entries(params).forEach(([key, value]) => {
                if (value && value !== "") {
                    url.searchParams.set(key, String(value));
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

        dispatch(setPage(page));
        dispatch(
            fetchAdminBadges({
                page,
                limit: memoisedLimit,
            })
        );
    }, [searchParams, dispatch, memoisedLimit]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await dispatch(
                fetchAdminBadges({
                    page: pagination.page,
                    limit: memoisedLimit,
                })
            ).unwrap();

            setShowReloadNotice(true);
            setTimeout(() => setShowReloadNotice(false), 5000);
        } catch (refreshError) {
            // Errors handled via slice
        } finally {
            setIsRefreshing(false);
        }
    }, [dispatch, memoisedLimit, pagination.page]);

    const handlePageChange = useCallback(
        (newPage) => {
            updateUrl({
                page: newPage,
            });

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        },
        [updateUrl]
    );

    const totalBadges = pagination.total || 0;

    return (
        <ContentWrapper>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Badge Packages ({totalBadges})
                    </h1>
                    <p
                        className="text-sm mt-1"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Manage badge offerings available for business directories.
                    </p>
                </div>
                {canManageBadges && (
                    <div className="flex items-center gap-3">
                        {showReloadNotice && (
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-success)" }}
                            >
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
                        {canCreate && (
                            <Button
                                icon={<Plus size={16} />}
                                onClick={() => setCreateModalOpen(true)}
                            >
                                New Badge
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <Card>
                {loading ? (
                    <SkeletonTable rows={8} />
                ) : error ? (
                    <div className="py-12 text-center space-y-4">
                        <p style={{ color: "var(--color-error)" }}>{error}</p>
                        <Button onClick={handleRefresh}>Try Again</Button>
                    </div>
                ) : badges.length === 0 ? (
                    <EmptyState
                        title="No badge packages found"
                        description="Create a new badge package to get started."
                        actionLabel={
                            canCreate ? "Create badge package" : undefined
                        }
                        onAction={
                            canCreate
                                ? () => setCreateModalOpen(true)
                                : undefined
                        }
                    />
                ) : (
                    <>
                        <AdminBadgeTable
                            badges={badges}
                            onEdit={
                                canEdit
                                    ? (badge) => setEditBadgeId(badge.id)
                                    : undefined
                            }
                            showActions={canEdit}
                        />
                        <div className="mt-6">
                            <Pagination
                                currentPage={pagination.page || 1}
                                totalPages={pagination.pages || 1}
                                totalItems={pagination.total || 0}
                                itemsPerPage={memoisedLimit}
                                onPageChange={handlePageChange}
                                showItemsPerPage={false}
                            />
                        </div>
                    </>
                )}
            </Card>

            {canCreate && (
                <AdminBadgeCreateModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    onCreated={handleRefresh}
                />
            )}

            {canEdit && (
                <AdminBadgeEditModal
                    isOpen={Boolean(editBadgeId)}
                    badgeId={editBadgeId}
                    onClose={() => setEditBadgeId(null)}
                    onUpdated={handleRefresh}
                />
            )}
        </ContentWrapper>
    );
}


