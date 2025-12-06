"use client";

import { HomeHero } from "./HomeHero";
import { HomeTopBanners } from "./HomeTopBanners";
import { HomeLatestAds } from "./HomeLatestAds";
import { HomeEvents } from "./HomeEvents";
import { HomeVideo } from "./HomeVideo";
import { HomeSponsoredDirectories } from "./HomeSponsoredDirectories";
import { HomeNewPost } from "./HomeNewPost";
import { DownloadApp } from "./DownloadApp";

export const HomePage = () => {
    return (
        <div className="flex flex-col w-full">
            <HomeHero />
            <HomeTopBanners />
            <HomeEvents />
            <HomeVideo />
            <HomeSponsoredDirectories />
            <HomeLatestAds />
            <HomeNewPost />
            <DownloadApp />
        </div>
    );
};
