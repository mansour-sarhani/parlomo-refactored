"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { bookmarkService } from "@/services/bookmark.service";

function AdLoopItem({ post }) {
    const [bookmarked, setBookmarked] = useState(false);
    const [bookmarkLoading, setBookmarkLoading] = useState(false);
    const url = process.env.NEXT_PUBLIC_URL_KEY || "";

    const bookmarkAd = async () => {
        if (bookmarkLoading) return;

        setBookmarkLoading(true);
        try {
            await bookmarkService.toggleAdBookmark(post.id);
            setBookmarked(!bookmarked);
        } catch (error) {
            console.error("Failed to toggle bookmark:", error);
        } finally {
            setBookmarkLoading(false);
        }
    };

    useEffect(() => {
        if (post.bookmarked) {
            setBookmarked(post.bookmarked);
        }
    }, [post]);

    const isPending = post.status === "Wait";
    const linkHref = isPending ? "#" : `/ad/${post.slug}`;

    // Format price display
    const priceDisplay = post.price === "0.00" || post.price === 0
        ? (post.quoteText || "Contact for price")
        : `£${post.price}`;

    return (
        <div className="ad-loop-item">
            <div className="ad-loop-item-image">
                <div className="ad-loop-item-bookmark">
                    <button
                        className={`ad-loop-item-bookmark-btn ${bookmarked ? 'saved' : ''}`}
                        onClick={bookmarkAd}
                        disabled={bookmarkLoading}
                        aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
                    >
                        <Star size={20} fill={bookmarked ? "currentColor" : "none"} />
                    </button>
                </div>
                <Link href={linkHref}>
                    {post.image && post.image.length !== 0 && (
                        <Image
                            src={url + post.path + '/' + post.image[0]}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            style={{ objectFit: 'cover' }}
                        />
                    )}
                    <div className="ad-loop-item-tags">
                        {isPending && (
                            <span className="ad-loop-item-tag pending">Pending</span>
                        )}
                    </div>
                </Link>
            </div>
            <div className="ad-loop-item-content">
                <Link href={linkHref} className="ad-loop-item-title">
                    {post.title}
                </Link>
                <div className="ad-loop-item-meta">
                    <div className="ad-loop-item-meta-item">
                        <span>{post.classifiedAdType} &gt; {post.categoryName}</span>
                    </div>
                    <div className="ad-loop-item-meta-item">
                        <span>{post.city}</span>
                    </div>
                </div>
                <div className="ad-loop-item-footer">
                    <div className="ad-loop-item-price">
                        {priceDisplay}
                    </div>
                    <div className="ad-loop-item-date">
                        <Clock size={16} />
                        <span>{post.createdAtHuman}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdLoopItem;
