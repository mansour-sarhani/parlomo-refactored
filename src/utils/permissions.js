/**
 * Permission checking utilities
 * Matches the legacy sidebar permission logic
 */

/**
 * Check if user has a specific permission group
 * @param {Array} userPermissions - Array of permission groups
 * @param {string} groupName - Name of the permission group
 * @returns {boolean}
 */
export function hasPermissionGroup(userPermissions, groupName) {
    if (!userPermissions || !Array.isArray(userPermissions)) {
        return false;
    }
    return userPermissions.some((item) => item.groupName === groupName);
}

/**
 * Check if user has a specific permission by name
 * @param {Array} userPermissions - Array of permission groups
 * @param {string} permissionName - Name of the permission
 * @returns {boolean}
 */
export function hasPermission(userPermissions, permissionName) {
    if (!userPermissions || !Array.isArray(userPermissions)) {
        return false;
    }
    return userPermissions.some((permissionGroup) =>
        permissionGroup.permissions?.find(
            (permission) => permission.name === permissionName
        )
    );
}

/**
 * Check if user is super-admin
 * @param {string} role - User role
 * @returns {boolean}
 */
export function isSuperAdmin(role) {
    return role === "super-admin";
}

/**
 * Check if user is an admin (super-admin or system-admin)
 * @param {string} role - User role
 * @returns {boolean}
 */
export function isAdminUser(role) {
    return role === "super-admin" || role === "system-admin";
}

/**
 * Check if user has access based on role OR permission group
 * @param {string} role - User role
 * @param {Array} userPermissions - Array of permission groups
 * @param {string} groupName - Name of the permission group
 * @returns {boolean}
 */
export function hasRoleOrGroup(role, userPermissions, groupName) {
    return isSuperAdmin(role) || hasPermissionGroup(userPermissions, groupName);
}

/**
 * Check if user has access based on role OR specific permission
 * @param {string} role - User role
 * @param {Array} userPermissions - Array of permission groups
 * @param {string} permissionName - Name of the permission
 * @returns {boolean}
 */
export function hasRoleOrPermission(role, userPermissions, permissionName) {
    return isSuperAdmin(role) || hasPermission(userPermissions, permissionName);
}

/**
 * Check if user has access based on role AND permission group AND specific permission
 * @param {string} role - User role
 * @param {Array} userPermissions - Array of permission groups
 * @param {string} groupName - Name of the permission group
 * @param {string} permissionName - Name of the permission
 * @returns {boolean}
 */
export function hasRoleAndGroupAndPermission(
    role,
    userPermissions,
    groupName,
    permissionName
) {
    return (
        isSuperAdmin(role) ||
        (hasPermissionGroup(userPermissions, groupName) &&
            hasPermission(userPermissions, permissionName))
    );
}

/**
 * Check menu item visibility based on permission config
 * @param {Object} permissionConfig - Permission configuration object
 * @param {string} role - User role
 * @param {Array} userPermissions - Array of permission groups
 * @param {Object} additionalChecks - Additional checks (e.g., hasDirectory)
 * @returns {boolean}
 */
export function checkMenuPermission(
    permissionConfig,
    role,
    userPermissions,
    additionalChecks = {}
) {
    if (!permissionConfig) {
        return true; // No permission config means always visible
    }

    // If requires super-admin only
    if (permissionConfig.superAdminOnly) {
        return isSuperAdmin(role);
    }

    // Additional checks (e.g., hasDirectory) - check first
    if (permissionConfig.requiresDirectory && !additionalChecks.hasDirectory) {
        return false;
    }

    // Super-admin bypasses all permission checks
    if (isSuperAdmin(role)) {
        return true;
    }

    // If both groupName and permission are specified, require both (AND condition)
    if (permissionConfig.groupName && permissionConfig.permission) {
        return (
            hasPermissionGroup(userPermissions, permissionConfig.groupName) &&
            hasPermission(userPermissions, permissionConfig.permission)
        );
    }

    // If only groupName is specified, check for group
    if (permissionConfig.groupName) {
        return hasPermissionGroup(userPermissions, permissionConfig.groupName);
    }

    // If only permission is specified, check for permission
    if (permissionConfig.permission) {
        return hasPermission(userPermissions, permissionConfig.permission);
    }

    return true;
}

