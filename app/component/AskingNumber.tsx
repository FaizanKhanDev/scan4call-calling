'use client';

import { useState, useRef, useEffect } from 'react'
import { Phone, CheckCircle, AlertCircle, XOctagon } from 'lucide-react'
import { ROYAL_BLUE, TEAL_CYAN, VIBRANT_GREEN } from '@/constant/color';
import { useSearchParams } from 'next/navigation'
import { useGetqrCodeByIdQuery } from '@/redux/api/qrCode';
import { addDataToQrCode } from '@/redux/slices/qrCodeSlices';
import { useDispatch } from 'react-redux';
import { useInitializeCallMutation, useVerifyPhoneNumberMutation } from '@/redux/api/publicCaller';
import { getFingerprint, getUserLocation, removeLeadingZero } from '@/helpers';
import { v4 as uuidv4 } from "uuid";
import countryCodes from '@/constant/countryCodes';
import { setCallType, setToken } from '@/redux/slices/publicCallerSlices';
import { useReSentOTPMutation } from '@/redux/api/publicCaller';
import { log } from 'console';

type InitCallData = {
    callerId?: number,
    token?: string,
    isNewNumber?: boolean
};

// --- New helper function to check for the "not found" case
function isQrCodeNotFound(data: any) {
    return (
        data &&
        data.status === "sucesss" &&
        data.data === null &&
        data.message &&
        typeof data.message === "string" &&
        data.message.toLowerCase().includes("qr code successfully fetched")
    );
}

export default function Scan4CallContact({
    setStartCalling,
    skiAPi,
}: {
    setStartCalling: (params: any) => void
    skiAPi: boolean
}) {

    const searchParams = useSearchParams();
    const type = searchParams.get('type');
    const key = searchParams.get('key');
    const code = searchParams.get('code');
    const sno = searchParams.get('sno');
    const dispatch = useDispatch();

    const [initializeCallApi] = useInitializeCallMutation();
    const [verifyPhoneNumberApi] = useVerifyPhoneNumberMutation();
    const [reSentOTPApi, { isLoading: isResendLoading }] = useReSentOTPMutation();

    const { data } = useGetqrCodeByIdQuery({
        code: code,
        skip: !skiAPi
    });

    // --- New: check for QR code not found
    const qrNotFound = isQrCodeNotFound(data);

    useEffect(() => {
        // Only add to store if data exists and is not the 'not found' case
        if (
            data &&
            data.status == "sucesss" &&
            data.data !== null
        ) {
            dispatch(addDataToQrCode(data?.data))
        }
    }, [data])

    // States for phone verification using a word code (animal/fruit)
    const [phoneNumber, setPhoneNumber] = useState('');
    const [codeSent, setCodeSent] = useState(false); // replaced otpSent
    const [wordCode, setWordCode] = useState<string>(''); // user input for code
    const [codeVerified, setCodeVerified] = useState(false); // replaces otpVerified
    const [codeError, setCodeError] = useState(''); // replaces otpError
    const [isLoading, setIsLoading] = useState(false);
    const [promptPhoneMsg, setPromptPhoneMsg] = useState('');
    const [permissionError, setPermissionError] = useState('');
    const [permissionStep, setPermissionStep] = useState<'idle' | 'requesting' | 'done' | 'error'>('idle');
    const [contactType, setContactType] = useState<'owner' | 'emergency' | null>(null);
    const [resendTimer, setResendTimer] = useState(0);

    // Permissions state
    const [microphoneGranted, setMicrophoneGranted] = useState<boolean>(false);
    const [locationGranted, setLocationGranted] = useState<boolean>(false);

    // Store init call server response to verify code/word later
    const [initCallData, setInitCallData] = useState<InitCallData | null>(null);

    // Dial code selection
    let defaultDialCode = {
        name: "Pakistan",
        route: "pk",
        flag: "🇵🇰",
        dialCode: "92",
        countryCode: "PK"
    };
    let dialCountry = defaultDialCode;
    if (key && typeof key === "string") {
        const ccMatch = countryCodes.find(cc => cc.countryCode.toLowerCase() === key.toLowerCase());
        if (ccMatch) dialCountry = ccMatch;
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setPhoneNumber(value);
        if (promptPhoneMsg) setPromptPhoneMsg('');
        if (permissionError) setPermissionError('');
    }

    async function requestMicrophonePermission() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            return { granted: false, message: "Microphone permissions are not supported on this device." };
        }
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            return { granted: true };
        } catch (err) {
            return { granted: false, message: "Microphone access denied. Please enable microphone access to proceed." };
        }
    }

    async function requestLocationPermission() {
        if (!navigator.geolocation) {
            return { granted: false, message: "Location permissions are not supported on this device." };
        }
        return new Promise<{ granted: boolean; message?: string }>((resolve) => {
            navigator.geolocation.getCurrentPosition(
                () => resolve({ granted: true }),
                (error) => {
                    let msg = "Location access denied. Please enable location access to proceed.";
                    if (error.code === 1) msg = "Location access denied. Please enable location access to proceed.";
                    else if (error.code === 2) msg = "Location unavailable.";
                    else if (error.code === 3) msg = "Location request timed out.";
                    resolve({ granted: false, message: msg });
                }
            );
        });
    }

    useEffect(() => {
        const askAllPermissions = async () => {
            setPermissionStep('requesting');
            setPermissionError('');
            // Microphone
            const mic = await requestMicrophonePermission();
            if (!mic.granted) {
                setPermissionError(mic.message || "Microphone permission denied.");
                setPermissionStep('error');
                setMicrophoneGranted(false);
                setLocationGranted(false);
                return;
            } else {
                setMicrophoneGranted(true);
            }
            // Location
            const loc = await requestLocationPermission();
            if (!loc.granted) {
                setPermissionError(loc.message || "Location permission denied.");
                setPermissionStep('error');
                setLocationGranted(false);
                return;
            } else {
                setLocationGranted(true);
            }
            setPermissionStep('done');
            setPermissionError('');
        };
        askAllPermissions();
    }, []);

    // This is now a workflow step setter
    const askPermissionsAndSendCode = async (type: 'owner' | 'emergency', callerIdFromCallApi?: number | null, isNewNumber?: boolean) => {
        if (permissionStep !== 'done' || !microphoneGranted || !locationGranted) {
            setPermissionError('Permissions are required to proceed. Please allow microphone and location access.');
            return;
        }
        // If it's NOT a new number, let them proceed
        if (!isNewNumber) {
            setStartCalling({
                start: true,
                callerId: initCallData?.callerId as number
            })
            return
        }
        handleSendCode(type, callerIdFromCallApi);
    };

    // Instead of OTP workflow, we prompt for animal/fruit name sent via SMS
    const handleSendCode = (type: 'owner' | 'emergency', callerIdFromCallApi?: number | null) => {
        if (!phoneNumber || phoneNumber.length < 10) {
            setPromptPhoneMsg('Kindly provide your 10-digit phone number to continue.');
            setCodeError('');
            return;
        }
        setPromptPhoneMsg('');
        setContactType(type);
        setCodeSent(true);
        setCodeError('');
        setWordCode('');
        setResendTimer(30);
    };

    const handleVerifyCode = async () => {
        if (!wordCode) {
            setCodeError('Please enter the animal or fruit name sent to your number.');
            return;
        }
        setCodeError('');
        setIsLoading(true);

        let finalCallerId = initCallData?.callerId;
        if (!finalCallerId) {
            setCodeError("Internal error: missing callerId for verification.");
            setIsLoading(false);
            return;
        }

        console.log("dialCountry", dialCountry);


        // Use wordCode as 'otp' for API payload for backward compatibility
        const verifyPayload = {
            callerId: finalCallerId,
            qrCodeId: code,
            phone: `${dialCountry.dialCode}${phoneNumber}`,
            otp: wordCode.trim()
        };

        try {
            const res = await verifyPhoneNumberApi(verifyPayload).unwrap();
            const responseData = res;
            if (
                responseData &&
                responseData.status === "sucesss"
            ) {
                setCodeVerified(true);
                setCodeError('');
                setStartCalling({
                    start: true,
                    callerId: initCallData?.callerId as number
                })
                dispatch(setToken(responseData?.data?.token))
            } else {
                setCodeError(responseData?.message || "Verification failed. Please try again.");
            }
        } catch (e: any) {
            setCodeError("Verification failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Reset everything (for changing phone or canceling)
    const resetAll = () => {
        setWordCode('');
        setCodeSent(false);
        setCodeVerified(false);
        setCodeError('');
        setContactType(null);
        setResendTimer(0);
        setPromptPhoneMsg('');
        setPermissionError('');
        setPermissionStep('done');
        setInitCallData(null);
    };

    // Countdown timer for resend
    useEffect(() => {
        if (codeSent && !codeVerified && resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer, codeSent, codeVerified]);

    const userAgent = typeof window !== "undefined" ? navigator.userAgent : "";

    // Resend code API implementation (same endpoint, but logic is for animal/fruit name)
    const handleResendCode = async () => {
        setWordCode('');
        setCodeError('');
        setResendTimer(30);

        try {
            if (!initCallData?.callerId) {
                setCodeError('Cannot resend code. Missing callerId.');
                return;
            }

            const payload = {
                callerId: initCallData.callerId,
                phone: `${dialCountry.dialCode}${phoneNumber}`,
            };

            await reSentOTPApi(payload).unwrap();
        } catch (e: any) {
            setCodeError("Failed to resend code. Please try again.");
        }
    };

    const [fingerprint, setFingerprint] = useState<string>("");
    const [geoLocation, setGeoLocation] = useState<any>(null);

    useEffect(() => {
        const fetchDeviceData = async () => {
            try {
                const fp = await getFingerprint();
                setFingerprint(fp);
                const location = await getUserLocation();

                setGeoLocation(location);
            } catch (error) {
                console.error("Error getting device info:", error);
            }
        };
        fetchDeviceData();
    }, []);

    // --- MAIN: Handle "Call Vehicle Owner" ---
    const handleCall = async (params: string) => {
        if (permissionStep !== 'done' || !microphoneGranted || !locationGranted) {
            setPermissionError('Permissions are required to proceed. Please allow microphone and location access.');
            return;
        }
        dispatch(setCallType(params));
        if (!phoneNumber || phoneNumber.length < 10) {
            setPromptPhoneMsg('Kindly provide your 10-digit phone number to continue.');
            setCodeError('');
            return;
        }
        setIsLoading(true);

        try {
            let deviceId = localStorage.getItem('deviceId');
            if (!deviceId) {
                deviceId = uuidv4();
                localStorage.setItem('deviceId', deviceId);
            }

            let myPhoneNumber = removeLeadingZero(phoneNumber)
            let payload = {
                deviceId: deviceId,
                qrCodeId: code,
                networkId: "",
                userAgent: userAgent,
                fingerprint: fingerprint,
                phone: `+${dialCountry.dialCode}${myPhoneNumber}`,
                location: `${geoLocation?.latitude ?? ""} ${geoLocation?.longitude ?? ""}`,
            }



            let result = await initializeCallApi(payload).unwrap()

            if (
                result &&
                result.status === 'sucesss' &&
                result.data &&
                typeof result.data.callerId !== "undefined"
            ) {
                if (!result?.data?.isNewNumber) {
                    dispatch(setToken(result?.data?.token))
                }
                setInitCallData(result.data as InitCallData);
                askPermissionsAndSendCode('owner', result.data.callerId, result?.data?.isNewNumber);
            } else {
                setPromptPhoneMsg("Failed to initiate call. Please try again.");
            }
        } catch (err) {
            console.log(err);
            setPromptPhoneMsg("Failed to initiate call. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    // Emergency button handler (no change to animal/fruit verification)
    const handleEmergency = async () => {
        if (permissionStep !== 'done' || !microphoneGranted || !locationGranted) {
            setPermissionError('Permissions are required to proceed. Please allow microphone and location access.');
            return;
        }
        setContactType('emergency');
        setCodeSent(true);
        setCodeError('');
        setWordCode('');
        setResendTimer(30);
    };

    // UI

    return (
        <div
            className="min-h-screen bg-white flex flex-col items-center justify-start px-6 py-1 "
            style={{ fontFamily: 'var(--font-montserrat)' }}
        >
            {/* Logo */}
            <div className="mb-2 flex flex-col items-center justify-center">
                <img
                    src="/logo.png"
                    alt="Logo"
                    className="h-16 w-16 mb-1 object-contain mx-auto"
                    style={{ maxWidth: "64px", maxHeight: "64px" }}
                />
                <img
                    src="/logotext.png"
                    alt="Logo Text"
                    className="h-7 mb-1 object-contain mx-auto"
                    style={{ maxWidth: "180px", maxHeight: "28px" }}
                />
            </div>

            {/* QR Code Not Found Block */}
            {qrNotFound && (
                <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-lg p-5 flex flex-col items-center my-6">
                    <XOctagon className="w-10 h-10 text-red-500 mb-2" />
                    <span className="text-lg text-red-600 font-bold mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        QR Code Not Found
                    </span>
                    <span className="text-sm text-gray-800 text-center mb-1" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        Sorry, the QR code you scanned was not found or is not registered.
                    </span>
                    <span className="text-xs text-gray-500 text-center" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        Please make sure you have scanned a valid QR code issued for vehicle contact. If this problem persists, contact support.
                    </span>
                </div>
            )}

            {/* Normal flow UI only if QR code IS FOUND */}
            {!qrNotFound && (
                <>
                    {/* Permission Step UI */}
                    {(permissionStep !== 'done') && (
                        <div className="w-full max-w-md bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex flex-col items-center mb-5">
                            <span className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-montserrat)', color: "#000" }}>
                                Permissions Required
                            </span>
                            <span className="text-sm text-gray-700 mb-2 text-center" style={{ fontFamily: 'var(--font-montserrat)' }}>
                                To continue, allow <b>Microphone</b> and <b>Location</b> permissions.
                            </span>
                            {permissionStep === 'requesting' && (
                                <span className="text-xs text-gray-500 animate-pulse">Requesting permissions...</span>
                            )}
                            {permissionError && (
                                <span className="text-xs text-red-500">{permissionError}</span>
                            )}
                            {/* Optional: how-to instructions if error */}
                            {permissionStep === 'error' && (
                                <span className="text-xs text-gray-500 mt-2 text-center">
                                    Please enable permissions in your browser/app settings and reload this page.
                                </span>
                            )}
                        </div>
                    )}

                    {/* Heading */}
                    <h1
                        className="text-lg mb-2 font-semibold text-gray-700 text-center"
                        style={{ fontFamily: 'var(--font-montserrat)' }}
                    >
                        Contact Vehicle Owner
                    </h1>

                    {/* Urdu Text (no Montserrat) */}
                    <p className="text-lg text-red-400 mb-8 text-center font-urdu" dir="rtl" style={{ fontFamily: 'Noto Nastaliq Urdu' }}>
                        گاڑی کے مالک سے رابطہ کرنے کے لئے اپنا فون نمبر درج کریں
                    </p>

                    {/* Phone Number Section and Word Verification Logic */}
                    {(permissionStep === 'done') && !codeSent && (
                        <>
                            <div className="w-full mb-8">
                                <label
                                    className="block text-sm font-semibold text-gray-900 mb-3"
                                    style={{ fontFamily: 'var(--font-montserrat)' }}>
                                    Your Phone Number
                                </label>
                                <div className="flex gap-3 mb-3">
                                    <div
                                        className="flex flex-1 items-center bg-gray-50 border rounded-lg px-3 py-3"
                                        style={{ borderColor: TEAL_CYAN, borderWidth: 2, fontFamily: 'var(--font-montserrat)' }}
                                    >
                                        <span className="text-gray-700 font-semibold whitespace-nowrap mr-2" style={{ fontFamily: 'var(--font-montserrat)' }}>
                                            {dialCountry?.flag} +{dialCountry?.dialCode}
                                        </span>
                                        <input
                                            type="tel"
                                            placeholder="3390144636"
                                            value={phoneNumber}
                                            onChange={handlePhoneChange}
                                            className="flex-1 px-2 py-1 bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none border-none"
                                            maxLength={10}
                                            disabled={codeSent}
                                            inputMode="numeric"
                                            style={{ minWidth: 0, fontFamily: 'var(--font-montserrat)' }}
                                        />
                                    </div>
                                </div>
                                {/* Prompt for missing number message */}
                                {promptPhoneMsg && (
                                    <div className="text-red-500 text-xs mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>{promptPhoneMsg}</div>
                                )}
                                {permissionError && (
                                    <div className="text-red-500 text-xs mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>{permissionError}</div>
                                )}
                                {codeError && (
                                    <div className="text-red-500 text-xs mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>{codeError}</div>
                                )}
                                <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>
                                    We’ll connect you directly to the vehicle owner{' '}
                                    <span className="font-semibold" style={{
                                        color: ROYAL_BLUE,
                                        fontFamily: 'var(--font-montserrat)'
                                    }}>Completely free of Cost.</span>
                                </p>
                                <p className="text-xs text-gray-700 mt-2" style={{ fontFamily: 'var(--font-montserrat)' }}>
                                    Before calling, we will request <b>Microphone</b> and <b>Location</b> permissions for your security and improved service.
                                </p>
                            </div>

                            {/* Call Button */}
                            <button
                                onClick={() => handleCall("GENERAL")}
                                disabled={isLoading}
                                style={{
                                    background: VIBRANT_GREEN,
                                    fontFamily: 'var(--font-montserrat)',
                                    opacity: isLoading ? 0.7 : 1,
                                    color: '#fff',
                                }}
                                className="w-full cursor-pointer text-white disabled:cursor-not-allowed text-black font-bold py-4 px-6 rounded-full flex items-center justify-center gap-2 mb-4 transition-colors"
                            >
                                <Phone className="w-5 h-5" />
                                {isLoading ? (
                                    <span className="ml-2">Processing...</span>
                                ) : (
                                    "Call Vehicle Owner"
                                )}
                            </button>

                            {/* Privacy Message */}
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="w-5 h-5" style={{
                                    color: TEAL_CYAN
                                }} />
                                <p className="text-sm text-gray-600" style={{ fontFamily: 'var(--font-montserrat)' }}>Your number will stay private.</p>
                            </div>

                            {/* Urdu Privacy Text (no Montserrat) */}
                            <p className="text-sm text-gray-600 mb-8 text-center font-urdu" dir="rtl">
                                آپ کا نمبر محفوظ رہے گا
                            </p>

                            {/* Emergency Button */}
                            <button
                                onClick={() => handleCall("EMERGENCY")}
                                disabled={isLoading}
                                style={{
                                    fontFamily: 'var(--font-montserrat)'
                                }}
                                className="bg-red-500 hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-bold py-3 px-12 rounded-full flex items-center justify-center gap-2 mb-2 transition-colors"
                            >
                                <AlertCircle className="w-5 h-5" />
                                {"Emergency"}
                            </button>
                            <p className="text-sm text-gray-600 text-center" style={{ fontFamily: 'var(--font-montserrat)' }}>
                                For accidents or emergencies only
                            </p>
                        </>
                    )}

                    {/* Code Workflow (COMMON for both contact types, animal/fruit word) */}
                    {(permissionStep === 'done') && codeSent && !codeVerified && (
                        <div className="mb-3 mt-2 bg-gradient-to-r from-[#FFFDE0] to-[#FFF3F0] px-5 py-5 rounded-lg flex flex-col items-center gap-2 w-full max-w-md"
                            style={{ fontFamily: 'var(--font-montserrat)' }}>
                            <div className={`w-full text-center mb-1 font-semibold ${contactType === "owner" ? "text-[#1a365d]" : "text-[#c95e26]"}`}
                                style={{ fontFamily: 'var(--font-montserrat)' }}>
                                {contactType === 'owner'
                                    ? 'Verify Your Phone Number'
                                    : 'Verify for Emergency Contact'}
                            </div>

                            <div className="w-full text-sm text-gray-600 text-center mb-1 mt-2" style={{ fontFamily: 'var(--font-montserrat)' }}>
                                {/* Main instruction as per prompt: */}
                                <span>
                                    We have sent the name of an <b>animal or fruit</b> to your phone number<b> +{dialCountry?.dialCode}{phoneNumber} </b>. Please type that name here to verify your phone number.
                                </span>
                            </div>
                            <div className="w-full flex flex-col items-center mb-2">
                                <input
                                    type="text"
                                    value={wordCode}
                                    onChange={e => setWordCode(e.target.value)}
                                    className="w-40 h-12 border border-gray-300 text-center text-black text-xl font-bold rounded focus:border-blue-400 outline-none bg-white"
                                    style={{ fontFamily: 'var(--font-montserrat)' }}
                                    placeholder="e.g. Apple"
                                    autoFocus
                                />
                            </div>
                            <button
                                className={`mt-2 font-semibold px-6 py-2 rounded-full transition-all hover:shadow-lg text-white ${contactType === 'owner'
                                    ? 'bg-gradient-to-r from-[#0052CC] to-[#00BCD4]'
                                    : 'bg-gradient-to-r from-[#FF8A65] to-[#FF5252]'}`}
                                style={{ fontFamily: 'var(--font-montserrat)' }}
                                onClick={handleVerifyCode}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Verifying...' : 'Verify'}
                            </button>
                            {/* Resend code and timer */}
                            <div className="flex flex-col items-center mt-1">
                                <button
                                    className="text-xs text-blue-900 underline disabled:opacity-40 disabled:pointer-events-none"
                                    style={{ fontFamily: 'var(--font-montserrat)' }}
                                    onClick={handleResendCode}
                                    disabled={resendTimer > 0 || isResendLoading}
                                >
                                    {isResendLoading ? 'Resending...' : 'Resend'}
                                </button>
                                {resendTimer > 0 && (
                                    <span className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'var(--font-montserrat)' }}>
                                        Please wait {resendTimer}s to resend
                                    </span>
                                )}
                            </div>
                            <button
                                className="text-xs text-blue-500 underline mt-1"
                                style={{ fontFamily: 'var(--font-montserrat)' }}
                                onClick={resetAll}
                            >
                                {contactType === "owner" ? "Change phone number" : "Cancel Emergency Contact"}
                            </button>
                            {codeError && (
                                <div className="text-red-500 text-xs mt-2" style={{ fontFamily: 'var(--font-montserrat)' }}>{codeError}</div>
                            )}
                        </div>
                    )}

                    {(permissionStep === 'done') && codeVerified && contactType === "owner" && (
                        <div className="mb-3 mt-2 bg-gradient-to-r from-[#D4FFEC] to-[#BDF4D7] px-5 py-4 rounded-lg flex flex-col items-center gap-2 w-full max-w-md"
                            style={{ fontFamily: 'var(--font-montserrat)' }}>
                            <div className="w-full text-center text-green-700 font-semibold" style={{ fontFamily: 'var(--font-montserrat)' }}>
                                Phone number verified!
                            </div>
                        </div>
                    )}

                    {(permissionStep === 'done') && codeVerified && contactType === "emergency" && (
                        <div className="mb-3 mt-2 bg-gradient-to-r from-[#FFDFDF] to-[#FFF8F0] px-5 py-4 rounded-lg flex flex-col items-center gap-2 w-full max-w-md"
                            style={{ fontFamily: 'var(--font-montserrat)' }}>
                            <div className="w-full text-center text-[#e32d2d] font-semibold" style={{ fontFamily: 'var(--font-montserrat)' }}>
                                Emergency contact confirmed!
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
