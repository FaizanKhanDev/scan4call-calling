'use client';

import { useState, useRef, useEffect } from 'react'
import { Phone, CheckCircle, AlertCircle } from 'lucide-react'
import { ROYAL_BLUE, TEAL_CYAN, VIBRANT_GREEN } from '@/constant/color';

// Use montserrat for all non-Urdu text by inline style

export default function Scan4CallContact() {
    // Phone number OTP states (COMMON)
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // New: prompt for phone number before sending OTP, if necessary
    const [promptPhoneMsg, setPromptPhoneMsg] = useState('');

    // Control logic for what the user is trying to do: "owner" or "emergency"
    const [contactType, setContactType] = useState<'owner' | 'emergency' | null>(null);

    // Timer for resend OTP
    const [resendTimer, setResendTimer] = useState(0);

    // For input focus control (same OTP input for all)
    const otpRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    // Handler for phone input (with number masking)
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setPhoneNumber(value);
        if (promptPhoneMsg) setPromptPhoneMsg(''); // clear error on change
    }

    // Handler for sending OTP (COMMON)
    const handleSendOtp = (type: 'owner' | 'emergency') => {
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
        setResendTimer(30); // Start timer on OTP send
    };

    // Handler for verifying OTP (COMMON)
    const handleVerifyOtp = () => {
        if (otp.every(d => d.length === 1)) {
            setOtpVerified(true);
            setOtpError('');
        } else {
            setOtpError('Enter the 4-digit code sent to your number');
        }
    };

    // Handler for when an OTP input changes (COMMON)
    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
        let newOtp = [...otp];
        newOtp[idx] = value;
        setOtp(newOtp);

        if (value && idx < 3) {
            otpRefs[idx + 1].current?.focus();
        }
    };

    // Handler for OTP backspace (COMMON)
    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
            otpRefs[idx - 1].current?.focus();
        }
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
    };

    // Effect for countdown timer (30s for resend)
    useEffect(() => {
        if (otpSent && !otpVerified && resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer, otpSent, otpVerified]);

    // Handler for resending OTP. Here, just resets timer and clears OTP fields.
    const handleResendOtp = () => {
        // Trigger OTP resend functionality here (API call)
        setOtp(['', '', '', '']);
        setOtpError('');
        setResendTimer(30); // Reset timer to 30s
    };

    return (
        <div
            className="min-h-screen bg-white flex flex-col items-center justify-start px-6 py-1 sm:hidden"
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
            <p className="text-lg text-red-400 mb-8 text-center font-urdu" dir="rtl" style={{
                fontFamily: 'Noto Nastaliq Urdu',
            }}>
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
                                <span className="text-gray-700 font-semibold whitespace-nowrap mr-2" style={{ fontFamily: 'var(--font-montserrat)' }}>🇵🇰 +92</span>
                                <input
                                    type="tel"
                                    placeholder="339 0144636"
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
                    </div>

                    {/* Call Button */}
                    <button
                        onClick={() => handleSendOtp('owner')}
                        disabled={isLoading}
                        style={{
                            background: VIBRANT_GREEN,
                            fontFamily: 'var(--font-montserrat)'
                        }}
                        className="w-full text-white disabled:cursor-not-allowed text-black font-bold py-4 px-6 rounded-full flex items-center justify-center gap-2 mb-4 transition-colors"
                    >
                        <Phone className="w-5 h-5" />
                        {"Call Vehicle Owner"}
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
                        onClick={() => handleSendOtp('emergency')}
                        disabled={isLoading}
                        style={{
                            fontFamily: 'var(--font-montserrat)'
                        }}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-bold py-3 px-12 rounded-full flex items-center justify-center gap-2 mb-2 transition-colors"
                    >
                        <AlertCircle className="w-5 h-5" />
                        Emergency
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
                        Enter the 4-digit code sent to <span className="font-medium" style={{ fontFamily: 'var(--font-montserrat)' }}>+92{phoneNumber}</span>
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
                    >
                        Verify OTP
                    </button>
                    {/* Resend OTP and timer */}
                    <div className="flex flex-col items-center mt-1">
                        <button
                            className="text-xs text-blue-900 underline disabled:opacity-40 disabled:pointer-events-none"
                            style={{ fontFamily: 'var(--font-montserrat)' }}
                            onClick={handleResendOtp}
                            disabled={resendTimer > 0}
                        >
                            Resend OTP
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
