const baseAssetUrl = (process.env.NEXT_PUBLIC_URL_KEY || "").replace(/\/+$/, "");

const isAbsoluteUrl = (value) => {
    if (typeof value !== "string") {
        return false;
    }

    return /^https?:\/\//i.test(value) || value.startsWith("data:");
};

const normalizeLeadingPath = (segment) => {
    if (!segment || typeof segment !== "string") {
        return "";
    }

    const cleaned = segment.trim();
    if (!cleaned) {
        return "";
    }

    return `/${cleaned.replace(/^\/+/, "").replace(/\/+$/, "")}`;
};

const buildAssetUrl = (value, hintPath) => {
    if (!value) {
        return null;
    }

    let candidate = value;

    if (typeof candidate !== "string") {
        candidate = String(candidate);
    }

    candidate = candidate.trim();
    if (!candidate) {
        return null;
    }

    if (isAbsoluteUrl(candidate)) {
        return candidate;
    }

    let pathHint = hintPath;

    if (pathHint && typeof pathHint !== "string") {
        pathHint = String(pathHint);
    }

    if (pathHint && isAbsoluteUrl(pathHint)) {
        const prefix = pathHint.replace(/\/+$/, "");
        const suffix = candidate.replace(/^\/+/, "");
        return `${prefix}/${suffix}`;
    }

    const normalizedPath =
        pathHint && pathHint.trim() !== ""
            ? normalizeLeadingPath(pathHint)
            : "";

    const relativeUrl =
        normalizedPath && normalizedPath !== "/"
            ? `${normalizedPath}/${candidate.replace(/^\/+/, "")}`
            : `/${candidate.replace(/^\/+/, "")}`;

    if (baseAssetUrl) {
        return `${baseAssetUrl}${relativeUrl}`;
    }

    return relativeUrl;
};

const ensureArray = (value) => {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    return [value];
};

const pathCandidatesFromItem = (item) => {
    if (!item || typeof item !== "object") {
        return [];
    }

    return [
        item.imagePath,
        item.imagesPath,
        item.media_path,
        item.mediaPath,
        item.path,
        item.thumbnailPath,
        item.thumbnail_path,
        item.bannerPath,
        item.banner_path,
    ].filter(Boolean);
};

const resolveMediaValue = (value, fallbackPaths = []) => {
    if (!value) {
        return null;
    }

    if (Array.isArray(value)) {
        for (const entry of value) {
            const resolved = resolveMediaValue(entry, fallbackPaths);
            if (resolved) {
                return resolved;
            }
        }
        return null;
    }

    if (typeof value === "object") {
        const nestedPaths = [
            value.path,
            value.imagePath,
            value.imagesPath,
            value.media_path,
            value.mediaPath,
            ...fallbackPaths,
        ].filter(Boolean);

        if (value.url) {
            return buildAssetUrl(value.url, nestedPaths[0]);
        }

        if (value.src) {
            return buildAssetUrl(value.src, nestedPaths[0]);
        }

        const nestedValue =
            value.image ||
            value.filename ||
            value.file ||
            value.fileName ||
            value.name ||
            value.value;

        if (nestedValue) {
            return resolveMediaValue(nestedValue, nestedPaths);
        }

        return null;
    }

    return buildAssetUrl(value, fallbackPaths[0]);
};

export const getPrimaryImage = (item) => {
    if (!item) {
        return null;
    }

    const fallbackPaths = pathCandidatesFromItem(item);

    const candidates = ensureArray([
        item.thumbnail,
        item.coverImage,
        item.cover_image,
        item.banner,
        item.image,
        item.images,
        item.media,
        item.gallery,
        item.photo,
    ]);

    for (const candidate of candidates) {
        const resolved = resolveMediaValue(candidate, fallbackPaths);
        if (resolved) {
            return resolved;
        }
    }

    return null;
};

export const formatDateTime = (value) => {
    if (!value) return "—";

    try {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    } catch {
        return value;
    }
};

export const formatCurrency = (value, currency = "GBP") => {
    if (value === undefined || value === null || value === "") {
        return "—";
    }

    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
        return value;
    }

    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(numeric);
};

