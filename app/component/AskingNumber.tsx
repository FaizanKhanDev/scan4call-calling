'use client';

import { useState, useRef, useEffect } from 'react'
import { Phone, CheckCircle, AlertCircle } from 'lucide-react'
import { ROYAL_BLUE, TEAL_CYAN, VIBRANT_GREEN } from '@/constant/color';
import { useSearchParams } from 'next/navigation'
import { useGetqrCodeByIdQuery } from '@/redux/api/qrCode';
import { addDataToQrCode } from '@/redux/slices/qrCodeSlices';
import { useDispatch } from 'react-redux';
import { useInitializeCallMutation, useVerifyPhoneNumberMutation } from '@/redux/api/publicCaller';
import { getFingerprint, getUserLocation } from '@/helpers';
import { v4 as uuidv4 } from "uuid";
import countryCodes from '@/constant/countryCodes';
import { setCallType, setToken } from '@/redux/slices/publicCallerSlices';
import { useReSentOTPMutation } from '@/redux/api/publicCaller';
// --- New: For storing callerId/token from init call ---
type InitCallData = {
    callerId?: number,
    token?: string,
    isNewNumber?: boolean
};

export default function Scan4CallContact({
    setStartCalling
}: {
    setStartCalling: (params: boolean) => void
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
        code: code
    });

    useEffect(() => {
        if (data && data.status == "sucesss") {
            dispatch(addDataToQrCode(data?.data))
        }
    }, [data])

    // Phone number OTP states (COMMON)
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [promptPhoneMsg, setPromptPhoneMsg] = useState('');
    const [permissionError, setPermissionError] = useState('');
    const [permissionStep, setPermissionStep] = useState<'idle' | 'requesting' | 'done'>('idle');
    const [contactType, setContactType] = useState<'owner' | 'emergency' | null>(null);
    const [resendTimer, setResendTimer] = useState(0);

    // Store init call server response to verify OTP later
    const [initCallData, setInitCallData] = useState<InitCallData | null>(null);

    // For input focus control
    const otpRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

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

    // Permissions (kept as in original, not enforced)
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

    // This is now a workflow step setter
    const askPermissionsAndSendOtp = async (type: 'owner' | 'emergency', callerIdFromCallApi?: number | null, isNewNumber?: boolean) => {
        setPermissionStep('requesting');
        setPermissionError('');
        // No permissions requested in UI (uncomment if needed)
        setPermissionStep('done');
        // CALL handleSendOtp with optional callerId to wire flow
        if (!isNewNumber) {
            setStartCalling(true)
            return
        }
        handleSendOtp(type, callerIdFromCallApi);
    };

    // handleSendOtp optionally gets a callerId (usually from init call API)
    const handleSendOtp = (type: 'owner' | 'emergency', callerIdFromCallApi?: number | null) => {
        if (!phoneNumber || phoneNumber.length < 10) {
            setPromptPhoneMsg('Kindly provide your 10-digit phone number to continue.');
            setOtpError('');
            return;
        }
        setPromptPhoneMsg('');
        setContactType(type);
        setOtpSent(true);
        setOtpError('');
        setOtp(['', '', '', '']);
        setResendTimer(30);
        // Don't clear initCallData unless starting over (needed for verify)
        // We rely on handleCall to update initCallData
    };

    // --- MAIN OTP SUBMISSION LOGIC (CALL verifyPhoneNumberApi) ---
    const handleVerifyOtp = async () => {
        if (!otp.every(d => d.length === 1)) {
            setOtpError('Enter the 4-digit code sent to your number');
            return;
        }
        setOtpError('');
        setIsLoading(true);

        // check if callerId available
        let finalCallerId = initCallData?.callerId;
        if (!finalCallerId) {
            setOtpError("Internal error: missing callerId for verification.");
            setIsLoading(false);
            return;
        }

        const verifyPayload = {
            callerId: finalCallerId,
            qrCodeId: code,
            phone: `${dialCountry.dialCode}${phoneNumber}`,
            otp: otp.join("")
        };

        try {
            const res = await verifyPhoneNumberApi(verifyPayload).unwrap();
            console.log("responseData?.data?.token", res);

            // RTK Query returns {data, error,...}
            const responseData = res;
            if (
                responseData &&
                responseData.status === "sucesss"
            ) {
                setOtpVerified(true);
                setOtpError('');
                setStartCalling(true)
                dispatch(setToken(responseData?.data?.token))
            } else {
                setOtpError(responseData?.message || "OTP verification failed. Please try again.");
            }
        } catch (e: any) {
            setOtpError("OTP verification failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // OTP input change handler
    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
        let newOtp = [...otp];
        newOtp[idx] = value;
        setOtp(newOtp);

        if (value && idx < 3) {
            otpRefs[idx + 1].current?.focus();
        }
    };

    // OTP backspace handler
    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
            otpRefs[idx - 1].current?.focus();
        }
    };

    // --- PASTE HANDLER for OTP fields ---
    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, '').slice(0, 4);

        if (!pasted) return;

        let newOtp = ['', '', '', ''];
        for (let i = 0; i < 4; i++) {
            if (pasted[i]) newOtp[i] = pasted[i];
        }
        setOtp(newOtp);
        // Focus next unfilled input
        for (let i = 0; i < 4; i++) {
            if (newOtp[i] === '' && otpRefs[i]?.current) {
                otpRefs[i].current?.focus();
                return;
            }
        }
        // If all filled, focus none.
    };

    // Reset everything (for changing phone or canceling)
    const resetAll = () => {
        setOtp(['', '', '', '']);
        setOtpSent(false);
        setOtpVerified(false);
        setOtpError('');
        setContactType(null);
        setResendTimer(0);
        setPromptPhoneMsg('');
        setPermissionError('');
        setPermissionStep('idle');
        setInitCallData(null);
    };

    // Countdown timer for resend
    useEffect(() => {
        if (otpSent && !otpVerified && resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer, otpSent, otpVerified]);

    const userAgent = typeof window !== "undefined" ? navigator.userAgent : "";

    // Resend OTP API implementation
    const handleResendOtp = async () => {
        setOtp(['', '', '', '']);
        setOtpError('');
        setResendTimer(30);

        // Call the reSentOTP API with callerId, phone, otp
        try {
            // Must have callerId (from initialize call) and phone
            if (!initCallData?.callerId) {
                setOtpError('Cannot resend OTP. Missing callerId.');
                return;
            }

            const payload = {
                callerId: initCallData.callerId,
                phone: `${dialCountry.dialCode}${phoneNumber}`,

            };

            let response = await reSentOTPApi(payload).unwrap();
            console.log("response", response);

            // Optionally, you could show a message: "OTP resent!"
        } catch (e: any) {
            setOtpError("Failed to resend OTP. Please try again.");
        }
    };

    // --- MAIN: Handle "Call Vehicle Owner" ---
    const handleCall = async (params: string) => {
        dispatch(setCallType(params));
        if (!phoneNumber || phoneNumber.length < 10) {
            setPromptPhoneMsg('Kindly provide your 10-digit phone number to continue.');
            setOtpError('');
            return;
        }
        setIsLoading(true);

        try {
            let deviceId = localStorage.getItem('deviceId');
            if (!deviceId) {
                deviceId = uuidv4();
                localStorage.setItem('deviceId', deviceId);
            }
            // let fingerprint = getFingerprint();
            // let getGeoLocation: any = getUserLocation();
            let payload = {
                deviceId: deviceId,
                qrCodeId: code,
                networkId: "",
                userAgent: "",
                fingerprint: "",
                phone: `${dialCountry.dialCode}${phoneNumber}`,
                location: "",
            }

            let result = await initializeCallApi(payload).unwrap()
            if (
                result &&
                result.status === 'sucesss' &&
                result.data &&
                typeof result.data.callerId !== "undefined"
            ) {
                // Store callerId/token for use in verify step
                setInitCallData(result.data as InitCallData);
                // Go to permissions/OTP entry, supplying the callerId
                askPermissionsAndSendOtp('owner', result.data.callerId, result?.data?.isNewNumber);
            } else {
                setPromptPhoneMsg("Failed to initiate call. Please try again.");
            }
        } catch (err) {
            setPromptPhoneMsg("Failed to initiate call. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    // Emergency button handler (for 'emergency', not calling initCallApi but can be extended)
    const handleEmergency = async () => {
        // In this logic, we do *not* call initializeCallApi, so no callerId.
        // Real implementation would replicate the above, adjust as needed.
        setContactType('emergency');
        setOtpSent(true);
        setOtpError('');
        setOtp(['', '', '', '']);
        setResendTimer(30);
    };

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

            {/* Phone Number Section and OTP Logic */}
            {!otpSent && (
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
                                    disabled={otpSent}
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
                        {otpError && (
                            <div className="text-red-500 text-xs mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>{otpError}</div>
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
                        disabled={isLoading || permissionStep === 'requesting'}
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
                        disabled={isLoading || permissionStep === 'requesting'}
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

            {/* OTP Workflow (COMMON for both contact types) */}
            {otpSent && !otpVerified && (
                <div className="mb-3 mt-2 bg-gradient-to-r from-[#FFFDE0] to-[#FFF3F0] px-5 py-5 rounded-lg flex flex-col items-center gap-2 w-full max-w-md"
                    style={{ fontFamily: 'var(--font-montserrat)' }}>
                    <div className={`w-full text-center mb-1 font-semibold ${contactType === "owner" ? "text-[#1a365d]" : "text-[#c95e26]"}`}
                        style={{ fontFamily: 'var(--font-montserrat)' }}>
                        {contactType === 'owner'
                            ? 'Verify Your Phone Number'
                            : 'Verify for Emergency Contact'}
                    </div>
                    <div className="w-full text-sm text-gray-600 text-center mb-1" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        Enter the 4-digit code sent to <span className="font-medium" style={{ fontFamily: 'var(--font-montserrat)' }}>{dialCountry?.flag} +{dialCountry.dialCode}{phoneNumber}</span>
                    </div>
                    <div className="flex gap-2 mb-2">
                        {otp.map((digit, idx) => (
                            <input
                                key={idx}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                ref={otpRefs[idx]}
                                value={digit}
                                onChange={e => handleOtpChange(e, idx)}
                                onKeyDown={e => handleOtpKeyDown(e, idx)}
                                onPaste={idx === 0 ? handleOtpPaste : undefined}
                                className="w-10 h-12 border border-gray-300 text-center text-black text-2xl font-bold rounded focus:border-blue-400 outline-none bg-white"
                                style={{ fontFamily: 'var(--font-montserrat)' }}
                            />
                        ))}
                    </div>
                    <button
                        className={`mt-2 font-semibold px-6 py-2 rounded-full transition-all hover:shadow-lg text-white ${contactType === 'owner'
                            ? 'bg-gradient-to-r from-[#0052CC] to-[#00BCD4]'
                            : 'bg-gradient-to-r from-[#FF8A65] to-[#FF5252]'}`}
                        style={{ fontFamily: 'var(--font-montserrat)' }}
                        onClick={handleVerifyOtp}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    {/* Resend OTP and timer */}
                    <div className="flex flex-col items-center mt-1">
                        <button
                            className="text-xs text-blue-900 underline disabled:opacity-40 disabled:pointer-events-none"
                            style={{ fontFamily: 'var(--font-montserrat)' }}
                            onClick={handleResendOtp}
                            disabled={resendTimer > 0 || isResendLoading}
                        >
                            {isResendLoading ? 'Resending...' : 'Resend OTP'}
                        </button>
                        {resendTimer > 0 && (
                            <span className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'var(--font-montserrat)' }}>
                                Please wait {resendTimer}s to resend OTP
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
                    {otpError && (
                        <div className="text-red-500 text-xs mt-2" style={{ fontFamily: 'var(--font-montserrat)' }}>{otpError}</div>
                    )}
                </div>
            )}

            {otpVerified && contactType === "owner" && (
                <div className="mb-3 mt-2 bg-gradient-to-r from-[#D4FFEC] to-[#BDF4D7] px-5 py-4 rounded-lg flex flex-col items-center gap-2 w-full max-w-md"
                    style={{ fontFamily: 'var(--font-montserrat)' }}>
                    <div className="w-full text-center text-green-700 font-semibold" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        Phone number verified!
                    </div>
                </div>
            )}

            {otpVerified && contactType === "emergency" && (
                <div className="mb-3 mt-2 bg-gradient-to-r from-[#FFDFDF] to-[#FFF8F0] px-5 py-4 rounded-lg flex flex-col items-center gap-2 w-full max-w-md"
                    style={{ fontFamily: 'var(--font-montserrat)' }}>
                    <div className="w-full text-center text-[#e32d2d] font-semibold" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        Emergency contact confirmed!
                    </div>
                </div>
            )}
        </div>
    );
}
