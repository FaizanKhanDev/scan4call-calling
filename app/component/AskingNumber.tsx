'use client';

import { Phone, Shield, AlertTriangle } from 'lucide-react';
import { useState, useRef } from 'react';

export default function Scan4CallContact() {
    // Owner Contact States
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpError, setOtpError] = useState('');

    // Emergency Contact States
    const [emergencyOtpSent, setEmergencyOtpSent] = useState(false);
    const [emergencyOtp, setEmergencyOtp] = useState(['', '', '', '']);
    const [emergencyOtpVerified, setEmergencyOtpVerified] = useState(false);
    const [emergencyOtpError, setEmergencyOtpError] = useState('');

    // For input focus control (owner and emergency otp fields)
    const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
    const emergencyOtpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

    // Handler for sending OTP (owner)
    const handleSendOtp = () => {
        if (phoneNumber && phoneNumber.length === 10) {
            setOtpSent(true);
            setOtpError('');
            setOtp(['', '', '', '']);
        } else {
            setOtpError('Please enter a valid 10-digit phone number');
        }
    };

    // Handler for verifying OTP (owner)
    const handleVerifyOtp = () => {
        if (otp.every(d => d.length === 1)) {
            setOtpVerified(true);
            setOtpError('');
        } else {
            setOtpError('Please enter the 4-digit OTP sent to your phone');
        }
    };

    // Handler for when an OTP input changes for owner
    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
        let newOtp = [...otp];
        newOtp[idx] = value;
        setOtp(newOtp);

        if (value && idx < 3) {
            otpRefs[idx + 1].current?.focus();
        }
    };

    // Handler for OTP backspace (owner)
    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
            otpRefs[idx - 1].current?.focus();
        }
    };

    // Handler for sending Emergency Contact OTP
    const handleEmergencySendOtp = () => {
        setEmergencyOtpSent(true);
        setEmergencyOtp(['', '', '', '']);
        setEmergencyOtpError('');
    }

    // Handler for verifying Emergency Contact OTP
    const handleEmergencyVerifyOtp = () => {
        if (emergencyOtp.every(d => d.length === 1)) {
            setEmergencyOtpVerified(true);
            setEmergencyOtpError('');
        } else {
            setEmergencyOtpError('Please enter the 4-digit OTP sent to your phone');
        }
    };

    // Handler for when an OTP input changes for emergency
    const handleEmergencyOtpChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
        let newOtp = [...emergencyOtp];
        newOtp[idx] = value;
        setEmergencyOtp(newOtp);

        if (value && idx < 3) {
            emergencyOtpRefs[idx + 1].current?.focus();
        }
    };

    // Handler for OTP backspace (emergency)
    const handleEmergencyOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === 'Backspace' && !emergencyOtp[idx] && idx > 0) {
            emergencyOtpRefs[idx - 1].current?.focus();
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 pt-0">
            <div className="w-full max-w-sm">
                {/* Header Section */}
                <div className="relative rounded-t-3xl bg-gradient-to-r from-[#0052CC] to-[#00BCD4] px-6 py-8 text-center text-white overflow-hidden mt-0">
                    {/* Decorative elements */}
                    <div className="absolute top-2 right-10 w-2 h-2 bg-white rounded-full opacity-40"></div>
                    <div className="absolute top-8 right-32 w-1 h-1 bg-white rounded-full opacity-30"></div>
                    <div className="absolute bottom-4 left-10 w-1.5 h-1.5 bg-white rounded-full opacity-20"></div>

                    {/* Logo */}
                    <div className="flex items-center justify-center mb-2">
                        <div className="bg-white p-1 flex items-center justify-center">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="w-8 h-8"
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                        <div className="bg-white p-1 flex items-center justify-center">
                            <img
                                src="/logotext.png"
                                alt="Scan4Call Text"
                                className="h-8"
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                    </div>
                    <p className="text-sm font-light tracking-wide">Contact Vehicle Owner</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-b-3xl shadow-lg px-6 py-6">
                    {/* Title */}
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-6 text-center">
                        Contact vehicle owner
                    </h2>

                    {/* Phone Input */}
                    <div className="mb-4 px-3 py-2 rounded-md border-2 border-[#00BCD4] bg-gradient-to-r from-[#F0FBFF] to-[#E0F7FF]">
                        <div className="flex items-center gap-3">
                            {/* Pakistan flag and +92 code */}
                            <div className="flex items-center gap-1 rounded px-2 py-1">
                                <span
                                    style={{
                                        fontSize: "18px",
                                        lineHeight: '1'
                                    }}
                                    aria-label="Pakistan Flag"
                                    role="img"
                                >
                                    🇵🇰
                                </span>
                                <span className="text-black font-semibold text-base">+92</span>
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="bg-transparent text-gray-700 font-medium text-lg outline-none w-full"
                                    placeholder="3xxxxxxxxx"
                                    inputMode="numeric"
                                    maxLength={10}
                                    disabled={otpSent}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Owner Contact OTP Workflow */}
                    {!otpSent && (
                        <button
                            className="w-full bg-gradient-to-r from-[#52C77F] to-[#4CAF50] text-white font-semibold py-3 px-5 rounded-md mb-3 flex items-center justify-center gap-2 hover:shadow-lg transition-shadow text-base"
                            onClick={handleSendOtp}
                        >
                            <Phone className="w-5 h-5" />
                            Call Vehicle Owner
                        </button>
                    )}

                    {otpSent && !otpVerified && (
                        <div className="mb-3 mt-2 bg-gradient-to-r from-[#FFFDE0] to-[#FFF3F0] px-5 py-5 rounded-lg flex flex-col items-center gap-2">
                            <div className="w-full text-center mb-1 text-[#1a365d] font-semibold">
                                Verify Your Phone Number
                            </div>
                            <div className="w-full text-sm text-gray-600 text-center mb-1">
                                Enter the 4-digit code sent to <span className="font-medium">+92-{phoneNumber}</span>
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
                                    />
                                ))}
                            </div>
                            <button
                                className="mt-2 bg-gradient-to-r from-[#0052CC] to-[#00BCD4] text-white font-semibold px-6 py-2 rounded-full transition-all hover:shadow-lg"
                                onClick={handleVerifyOtp}
                            >
                                Verify OTP
                            </button>
                            <button
                                className="text-xs text-blue-500 underline mt-1"
                                onClick={() => { setOtp(['', '', '', '']); setOtpSent(false); setOtpError(''); }}
                            >
                                Change phone number
                            </button>
                            {otpError && (
                                <div className="text-red-500 text-xs mt-2">{otpError}</div>
                            )}
                        </div>
                    )}

                    {otpVerified && (
                        <div className="mb-3 mt-2 bg-gradient-to-r from-[#D4FFEC] to-[#BDF4D7] px-5 py-4 rounded-lg flex flex-col items-center gap-2">
                            <div className="w-full text-center text-green-700 font-semibold">
                                Phone number verified!
                            </div>
                        </div>
                    )}

                    {/* Emergency Contact */}
                    {/* Show workflow for Emergency Contact similar to above */}
                    {!emergencyOtpSent && (
                        <button
                            className="w-full bg-gradient-to-r from-[#FF8A65] to-[#FF5252] text-white font-semibold py-3 px-5 rounded-md mb-5 flex items-center justify-center gap-2 hover:shadow-lg transition-shadow text-base"
                            onClick={handleEmergencySendOtp}
                        >
                            <AlertTriangle className="w-5 h-5" />
                            Emergency Contact
                        </button>
                    )}

                    {emergencyOtpSent && !emergencyOtpVerified && (
                        <div className="mb-3 mt-2 bg-gradient-to-r from-[#FFFDE0] to-[#FFF3F0] px-5 py-5 rounded-lg flex flex-col items-center gap-2">
                            <div className="w-full text-center mb-1 text-[#c95e26] font-semibold">
                                Verify for Emergency Contact
                            </div>
                            <div className="w-full text-sm text-gray-600 text-center mb-1">
                                Enter the 4-digit code sent to your number
                            </div>
                            <div className="flex gap-2 mb-2">
                                {emergencyOtp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        ref={emergencyOtpRefs[idx]}
                                        value={digit}
                                        onChange={e => handleEmergencyOtpChange(e, idx)}
                                        onKeyDown={e => handleEmergencyOtpKeyDown(e, idx)}
                                        className="w-10 h-12 border border-gray-300 text-center text-2xl font-bold rounded focus:border-blue-400 outline-none bg-white"
                                    />
                                ))}
                            </div>
                            <button
                                className="mt-2 bg-gradient-to-r from-[#FF8A65] to-[#FF5252] text-white font-semibold px-6 py-2 rounded-full transition-all hover:shadow-lg"
                                onClick={handleEmergencyVerifyOtp}
                            >
                                Verify OTP
                            </button>
                            <button
                                className="text-xs text-blue-500 underline mt-1"
                                onClick={() => { setEmergencyOtp(['', '', '', '']); setEmergencyOtpSent(false); setEmergencyOtpError(''); }}
                            >
                                Cancel Emergency Contact
                            </button>
                            {emergencyOtpError && (
                                <div className="text-red-500 text-xs mt-2">{emergencyOtpError}</div>
                            )}
                        </div>
                    )}

                    {emergencyOtpVerified && (
                        <div className="mb-3 mt-2 bg-gradient-to-r from-[#FFDFDF] to-[#FFF8F0] px-5 py-4 rounded-lg flex flex-col items-center gap-2">
                            <div className="w-full text-center text-[#e32d2d] font-semibold">
                                Emergency contact confirmed!
                            </div>
                        </div>
                    )}

                    {/* Privacy Notice */}
                    <div className="bg-gradient-to-r from-[#F0FBFF] to-[#E0F7FF] rounded-2xl p-4 mb-6 border border-[#B2EBF2]">
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-5 h-5 text-[#00897B]" />
                            <p className="text-gray-700 font-medium">
                                Your number will stay private.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
