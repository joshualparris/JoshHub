"use client";

import { useEffect } from "react";

export default function PanosPage() {
    useEffect(() => {
        // Redirect to the static index in public/panos
        window.location.replace("/panos/index.html");
    }, []);

    return (
        <div>
            <p>Redirecting to panos index...</p>
        </div>
    );
}
