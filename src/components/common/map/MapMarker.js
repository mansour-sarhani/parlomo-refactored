"use client";

import DirectoryLoopItem from "../../front/loops/DirectoryLoopItem";

function MapMarker({ onClick, business, isShowBusiness, selectedBusiness }) {
    return (
        <div className="map-item-card" onClick={onClick}>
            {isShowBusiness && selectedBusiness === business.id && (
                <div className="map-item">
                    <DirectoryLoopItem post={business} />
                </div>
            )}
            <img 
                src="/images/new_pin.png" 
                alt="marker" 
                style={{ height: '61px', width: '40px', cursor: 'pointer' }} 
            />
        </div>
    );
}

export default MapMarker;
