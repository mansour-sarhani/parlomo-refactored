import { useState, useEffect } from "react";

export default function useGeolocation(options = {}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({});

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setError({
                code: 0,
                message: "Geolocation not supported",
            });
            setLoading(false);
            return;
        }

        const successHandler = (position) => {
            setLoading(false);
            setData(position);
            setError(null);
        };

        const errorHandler = (error) => {
            setLoading(false);
            setError(error);
        };

        navigator.geolocation.getCurrentPosition(
            successHandler,
            errorHandler,
            options
        );
    }, [options]);

    return { loading, error, data };
}
