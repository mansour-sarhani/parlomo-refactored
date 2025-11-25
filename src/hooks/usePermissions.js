"use client";

import { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import unserialize from "locutus/php/var/unserialize";
import { STORAGE_KEYS } from "@/constants/config";

/**
 * Hook to decrypt and retrieve user permissions and role from localStorage
 * Matches the legacy useLocalStorageUserData hook behavior
 * Supports both legacy (userData) and refactored (parlomo_user) storage keys
 * @returns {{ permissions: Array, role: string, loading: boolean }}
 */
export function usePermissions() {
    const [permissions, setPermissions] = useState([]);
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined") {
            setLoading(false);
            return;
        }

        try {
            const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
            
            // Try refactored app key first, then legacy key
            let userDataStr = localStorage.getItem(STORAGE_KEYS.USER) || localStorage.getItem("userData");

            if (!userDataStr || !encryptionKey) {
                setPermissions([]);
                setRole("");
                setLoading(false);
                return;
            }

            const userData = JSON.parse(userDataStr);

            // Handle case variations: Mtrc (refactored) or mtrc (legacy)
            const permissionsKey = userData.Mtrc || userData.mtrc;

            // Decrypt permissions (Mtrc/mtrc)
            if (permissionsKey) {
                try {
                    let encryptStr = CryptoJS.enc.Base64.parse(permissionsKey);
                    let encryptData = encryptStr.toString(CryptoJS.enc.Utf8);
                    encryptData = JSON.parse(encryptData);
                    let iv = CryptoJS.enc.Base64.parse(encryptData.iv);
                    let decrypted = CryptoJS.AES.decrypt(
                        encryptData.value,
                        CryptoJS.enc.Base64.parse(encryptionKey),
                        {
                            iv: iv,
                            mode: CryptoJS.mode.CBC,
                            padding: CryptoJS.pad.Pkcs7,
                        }
                    );
                    decrypted = CryptoJS.enc.Utf8.stringify(decrypted);
                    const userPermissions = unserialize(decrypted);
                    setPermissions(userPermissions || []);
                } catch (error) {
                    console.error("Failed to decrypt permissions:", error);
                    setPermissions([]);
                }
            } else {
                setPermissions([]);
            }

            // Decrypt role (rms)
            if (userData.rms) {
                try {
                    let encryptStrRole = CryptoJS.enc.Base64.parse(userData.rms);
                    let encryptDataRole = encryptStrRole.toString(CryptoJS.enc.Utf8);
                    encryptDataRole = JSON.parse(encryptDataRole);
                    let ivRole = CryptoJS.enc.Base64.parse(encryptDataRole.iv);
                    let decryptedRole = CryptoJS.AES.decrypt(
                        encryptDataRole.value,
                        CryptoJS.enc.Base64.parse(encryptionKey),
                        {
                            iv: ivRole,
                            mode: CryptoJS.mode.CBC,
                            padding: CryptoJS.pad.Pkcs7,
                        }
                    );
                    decryptedRole = CryptoJS.enc.Utf8.stringify(decryptedRole);
                    setRole(decryptedRole || "");
                } catch (error) {
                    console.error("Failed to decrypt role:", error);
                    setRole("");
                }
            } else {
                setRole("");
            }
        } catch (error) {
            console.error("Failed to read user data from localStorage:", error);
            setPermissions([]);
            setRole("");
        } finally {
            setLoading(false);
        }
    }, []);

    return { permissions, role, loading };
}

