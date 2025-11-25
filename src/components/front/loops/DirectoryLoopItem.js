"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Star } from "lucide-react";
import { useEffect, useState } from "react";

function DirectoryLoopItem({ post }) {
    const [bookmarked, setBookmarked] = useState(false);
    const url = process.env.NEXT_PUBLIC_URL_KEY || "";

    const bookmarkDirectory = () => {
        // TODO: Implement bookmark service
        console.log("Bookmark clicked", post.id);
        setBookmarked(!bookmarked);
    };

    useEffect(() => {
        if (post.bookmarked) {
            setBookmarked(post.bookmarked);
        }
    }, [post]);

    const isPending = post.status === "Pending" || post.status === "PaymentPending";
    const linkHref = isPending ? "#" : `/directory/${post.slug}`;

    return (
        <div className="directory-loop-item">
            <div className="directory-loop-item-image">
                <div className="directory-loop-item-bookmark">
                    <button
                        className={`directory-loop-item-bookmark-btn ${bookmarked ? 'saved' : ''}`}
                        onClick={bookmarkDirectory}
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
                    <div className="directory-loop-item-tags">
                        {post.isVerifiedBusiness && (
                            <span className="directory-loop-item-tag verified">Verified</span>
                        )}
                        {post.isSponsored && (
                            <span className="directory-loop-item-tag sponsored">Sponsored</span>
                        )}
                        {post.status === "Pending" && (
                            <span className="directory-loop-item-tag pending">Pending</span>
                        )}
                        {post.status === "PaymentPending" && (
                            <span className="directory-loop-item-tag pending">Pending Payment</span>
                        )}
                    </div>
                </Link>
            </div>
            <div className="directory-loop-item-content">
                <Link href={linkHref} className="directory-loop-item-title">
                    {post.title}
                </Link>
                <div className="directory-loop-item-meta">
                    <div className="directory-loop-item-meta-item">
                        <span className="directory-loop-item-meta-label">Category:</span>
                        <span>{post.categoryName}</span>
                    </div>
                    <div className="directory-loop-item-meta-item">
                        <span>{post.city}</span>
                    </div>
                </div>
                <div className="directory-loop-item-footer">
                    <div className="directory-loop-item-date">
                        <Clock size={16} />
                        <span>{post.createdAtHuman}</span>
                    </div>
                    <div className="directory-loop-item-rating">
                        <Star size={16} fill="currentColor" />
                        <span>{post.rate || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DirectoryLoopItem;
