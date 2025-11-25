"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, RefreshCcw } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { SkeletonTable } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import {
    AdminAdvertisingTypesTable,
    AdminAdvertisingTypeCreateModal,
    AdminAdvertisingTypeEditModal,
} from "@/features/advertising/components";
import {
    fetchAdminAdvertisingTypes,
    setPage,
} from "@/features/advertising/adminAdvertisingTypesSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useAuth } from "@/contexts/AuthContext";

const AD_PERMISSION_GROUP = "OmidAdvertising";

const hasPermission = (permissionGroups, permissionName) => {
    if (!Array.isArray(permissionGroups)) {
        return false;
    }

    const group = permissionGroups.find((item) => item.groupName === AD_PERMISSION_GROUP);
    if (!group) {
        return false;
    }

    return group.permissions?.some((permission) => permission.name === permissionName);
};

export default function AdminAdvertisingTypesPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { authData } = useAuth();

    const {
        list: types,
        loading,
        error,
        pagination,
    } = useAppSelector((state) => state.adminAdvertisingTypes);

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [showReloadNotice, setShowReloadNotice] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const tableRef = useRef(null);

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

    const canCreate =
        role === "super-admin" ||
        hasPermission(permissionGroups, "publish OmidAdvertising");

    const canEdit =
        role === "super-admin" ||
        hasPermission(permissionGroups, "edit OmidAdvertising");

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
            fetchAdminAdvertisingTypes({
                page,
                limit: 10,
            })
        );
    }, [searchParams, dispatch]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await dispatch(
                fetchAdminAdvertisingTypes({
                    page: pagination.page,
                    limit: memoisedLimit,
                })
            ).unwrap();

            setShowReloadNotice(true);
            setTimeout(() => setShowReloadNotice(false), 5000);
        } catch (error) {
            // Errors are surfaced through the slice/toasts; no-op here.
        } finally {
            setIsRefreshing(false);
        }
    }, [dispatch, memoisedLimit, pagination.page]);

    const handlePageChange = useCallback(
        (newPage) => {
            updateUrl({ page: newPage });

            if (tableRef.current) {
                tableRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        },
        [updateUrl]
    );

    const totalItems = pagination.total || 0;

    return (
        <ContentWrapper>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Advertising Types ({totalItems})
                    </h1>
                    <p
                        className="text-sm mt-1"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Manage available advertising placements and their associated assets.
                    </p>
                </div>
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
                            New Type
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <div ref={tableRef}>
                    {loading ? (
                        <SkeletonTable rows={8} />
                    ) : error ? (
                        <div className="py-12 text-center space-y-4">
                            <p style={{ color: "var(--color-error)" }}>{error}</p>
                            <Button onClick={handleRefresh}>Try Again</Button>
                        </div>
                    ) : !types || types.length === 0 ? (
                        <EmptyState
                            title="No advertising types found"
                            description="Create a new advertising type to get started."
                            actionLabel={canCreate ? "Create advertising type" : undefined}
                            onAction={canCreate ? () => setCreateModalOpen(true) : undefined}
                        />
                    ) : (
                        <>
                            <AdminAdvertisingTypesTable
                                types={types}
                                onEdit={canEdit ? (type) => setEditingType(type) : undefined}
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
                </div>
            </Card>

            {canCreate && (
                <AdminAdvertisingTypeCreateModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    onCreated={handleRefresh}
                />
            )}

            {canEdit && (
                <AdminAdvertisingTypeEditModal
                    isOpen={Boolean(editingType)}
                    typeData={editingType}
                    onClose={() => setEditingType(null)}
                    onUpdated={handleRefresh}
                />
            )}
        </ContentWrapper>
    );
}
