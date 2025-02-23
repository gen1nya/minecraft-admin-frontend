import { useState, useEffect, useRef } from "react";

export const useLongPress = (callback, delay = 700) => {
    const [isPressing, setIsPressing] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (isPressing) {
            timeoutRef.current = setTimeout(callback, delay);
        } else {
            clearTimeout(timeoutRef.current);
        }
        return () => clearTimeout(timeoutRef.current);
    }, [isPressing, callback, delay]);

    return {
        onMouseDown: () => setIsPressing(true),
        onMouseUp: () => setIsPressing(false),
        onMouseLeave: () => setIsPressing(false),
        onTouchStart: () => setIsPressing(true),
        onTouchEnd: () => setIsPressing(false),
    };
};
