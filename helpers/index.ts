import FingerprintJS from '@fingerprintjs/fingerprintjs';

async function getFingerprint() {
    // Initialize an agent
    const fp = await FingerprintJS.load();

    // Get visitor identifier
    const result = await fp.get();

    return result.visitorId;
}



const getUserLocation = () => {
    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
        if (!navigator.geolocation) {
            return reject(new Error("Geolocation is not supported by your browser"));
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true, // more accurate GPS if available
                timeout: 10000,           // 10 seconds max
                maximumAge: 0,            // do not use cached position
            }
        );
    });
}

const removeLeadingZero = (num: string | number): string => {
    const value = String(num);

    if (value.startsWith("0")) {
        return value.substring(1);
    }

    return value;
};


export {
    removeLeadingZero,
    getFingerprint,
    getUserLocation
}
