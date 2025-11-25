"use client";

import styles from "@/styles/front/searchForm.module.css";
import { useEffect, useRef, useState } from "react";
import { useFormikContext } from "formik";
import { businessListingsService } from "@/services/businesses";

function LocationInput({ setCurrentInput, reset, onLocationSelect }) {
    const [inputValue, setInputValue] = useState("");
    const [results, setResults] = useState([]);
    const [error, setError] = useState();

    const inputRef = useRef(null);
    
    // Try to get Formik context, but don't fail if it's not available
    let formikContext;
    try {
        formikContext = useFormikContext();
    } catch (e) {
        formikContext = null;
    }
    
    const setFieldValue = formikContext?.setFieldValue;
    const isNightMode = false;

    useEffect(() => {
        if (inputValue.length > 3 && inputRef.current === document.activeElement) {
            businessListingsService.searchLocations(inputValue)
                .then(res => {
                    setResults(res.data.locationList);
                    setError('');
                })
                .catch(err => setError(err.message));
        }
    }, [inputValue]);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const postcode = searchParams.get("postcode");
        const location = searchParams.get("location");
        if (postcode) {
            setInputValue(postcode);
        } else if (location) {
            setInputValue(location);
        }
    }, []);

    useEffect(() => {
        setInputValue("");
    }, [reset]);

    const handleLocationSelect = (result) => {
        if (result.type === "location") {
            setInputValue(result.name);
            if (setFieldValue) {
                setFieldValue("location", result.name);
                setFieldValue("postcode", "");
            }
            if (onLocationSelect) {
                onLocationSelect({ location: result.name, postcode: "" });
            }
            setResults([]);
        }
        if (result.type === "postcode") {
            setInputValue(result.name);
            if (setFieldValue) {
                setFieldValue("postcode", result.name);
                setFieldValue("location", "");
            }
            if (onLocationSelect) {
                onLocationSelect({ postcode: result.name, location: "" });
            }
            setResults([]);
        }
    };

    const handleBlur = (e) => {
        // Delay clearing results to allow click event to fire
        setTimeout(() => {
            if (!inputValue) {
                setResults([]);
            }
        }, 200);
        
        if (e.target.value === "") {
            setInputValue("");
            if (setFieldValue) {
                setFieldValue("location", "");
                setFieldValue("postcode", "");
            }
            if (onLocationSelect) {
                onLocationSelect({ location: "", postcode: "" });
            }
        }
    };

    return (
        <div className={isNightMode ? styles.frontNightMode + " " + styles.locationInput : styles.locationInput}>
            <input
                type="text"
                className={styles.postcodeInput}
                placeholder={"Post Code or Address ..."}
                value={inputValue}
                ref={inputRef}
                onBlur={handleBlur}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    setCurrentInput(e.target.value);
                }}
            />
            {results && results.length > 0 && (
                <ul className={styles.locationResults}>
                    {results.map((result) => (
                        <li key={result.id} id={result.id} onClick={() => handleLocationSelect(result)}>
                            {result.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default LocationInput;
