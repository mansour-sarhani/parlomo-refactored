"use client";

function MyLocationMarker() {
    return (
        <div className="map-item-card">
            <span className="my-location-text">Your Location</span>
            <img 
                src="/images/my-location.png" 
                alt="Your location marker" 
                style={{ height: '61px', width: '40px' }} 
            />
        </div>
    );
}

export default MyLocationMarker;
