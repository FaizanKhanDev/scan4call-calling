"use client";
import React, { useEffect, useState } from 'react';
import { VIBRANT_GREEN } from '@/constant/color';
import { Phone } from 'lucide-react';

const CALLER_IMAGE = 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png';

// Example blood group and emergency notes -- in a real app, these would be props or context
const BLOOD_GROUP = 'B+';
const EMERGENCY_NOTES = "Allergic to penicillin. In case of emergency, call his wife at 9999900000.";

function formatDuration(sec: number) {
    const minutes = String(Math.floor(sec / 60)).padStart(2, '0');
    const seconds = String(sec % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
}

export default function Calling() {
    const [callDuration, setCallDuration] = useState(0); // In seconds
    const [callActive, setCallActive] = useState(false);
    const [ringing, setRinging] = useState(true);

    // For simple pulse animation using CSS classes
    const [pulsing, setPulsing] = useState(true);

    useEffect(() => {
        // Show ringing for 2.5 seconds, then connect
        let ringingTimeout: NodeJS.Timeout;
        if (ringing) {
            ringingTimeout = setTimeout(() => {
                setRinging(false);
                setCallActive(true);
            }, 2500);
        }
        return () => ringingTimeout && clearTimeout(ringingTimeout);
    }, [ringing]);

    // Start call timer only when call is active
    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        if (callActive) {
            interval = setInterval(() => setCallDuration((sec) => sec + 1), 1000);
        }
        return () => interval && clearInterval(interval);
    }, [callActive]);

    // Stop pulsing animation when call is ended
    useEffect(() => {
        // When both callActive and ringing are false, that means ended
        if (!callActive && !ringing) {
            setPulsing(false);
        }
    }, [callActive, ringing]);

    const handleEndCall = () => {
        setCallActive(false);
    };

    let statusBarColor = ringing ? '#FE9600' : callActive ? '#1AC65D' : '#F33';
    let statusBarText = ringing ? 'Ringing...' : callActive ? 'In Call' : 'Call Ended';
    let statusBarTextColor = '#fff';

    return (
        <div className="relative min-h-[480px] flex flex-col items-center justify-center bg-[#07132C] py-2 pb-10 w-full"
            style={{ minHeight: 480 }}>
            {/* Status Bar */}
            <div className="absolute top-0 left-0 w-full flex items-center justify-center h-8 z-10"
                style={{ backgroundColor: statusBarColor }}>
                <span
                    className="font-medium"
                    style={{ fontSize: 13, color: statusBarTextColor, letterSpacing: 0.5, fontFamily: 'var(--font-montserrat)' }}
                >
                    {statusBarText}
                </span>
            </div>

            {/* Pulsing Avatar */}
            <div className="flex flex-col items-center justify-center my-4 mt-16 relative">
                {/* Pulse effect */}
                <span
                    aria-hidden
                    className={`
                        absolute 
                        left-1/2 top-1/2 
                        -translate-x-1/2 -translate-y-1/2
                        w-[134px] h-[134px] rounded-full
                        bg-[rgba(44,227,179,0.29)]
                        z-0
                        ${pulsing && "animate-pulse-slow"}
                    `}
                    style={{ transition: 'transform 0.7s', zIndex: 1 }}
                />
                <img
                    src={CALLER_IMAGE}
                    alt="Caller"
                    width={110}
                    height={110}
                    className="relative rounded-full border-4"
                    style={{
                        borderColor: VIBRANT_GREEN,
                        background: '#F6F7FB',
                        zIndex: 2,
                    }}
                />
            </div>

            <div className="text-2xl text-white font-bold text-center mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>
                John Doe
            </div>
            <div className="text-[#D3EEE7] text-sm mb-1 text-center" style={{ letterSpacing: 0.15 }}>
                Mobile
            </div>




            {/* Call status panel */}
            <div className="flex flex-col items-center mt-1">
                {ringing ? (
                    <>
                        {/* Simple animated dots for ringing */}
                        <div className="flex flex-row items-center justify-center mb-5">
                            <span className="inline-block w-5 text-[#FE9600] animate-spin">
                                <svg width={20} viewBox="0 0 20 20" fill="none"><circle cx={10} cy={10} r={8} stroke="#FE9600" strokeWidth={2} /></svg>
                            </span>
                            <span className="ml-2 text-[17px] text-[#f9c97e] tracking-wider"
                                style={{ letterSpacing: 2 }}>
                                Ringing...
                            </span>
                        </div>
                    </>
                ) : callActive ? (
                    <>
                        <div className="font-semibold mt-0 mb-0.5 text-[19px]" style={{ color: '#39FA98' }}>
                            Call Connected
                        </div>
                        <span
                            className="font-bold text-lg tracking-widest"
                            style={{
                                color: '#fff',
                                fontFamily: 'monospace',
                                marginBottom: 30,
                                marginTop: 4,
                                letterSpacing: 1
                            }}
                        >
                            {formatDuration(callDuration)}
                        </span>
                    </>
                ) : (
                    <span className="font-semibold mt-3 mb-1 text-[19px]" style={{ color: '#F33' }}>
                        Call Ended
                    </span>
                )}
            </div>


            {/* Emergency Notes and Blood Group */}
            <div className="flex flex-col items-center mb-2 w-full px-4 max-w-md">
                <div className="flex flex-row items-center gap-4 justify-center w-full">
                    <div className="flex flex-row items-center bg-[#1b5247] rounded px-2.5 py-1 gap-1.5 mb-0.5 border border-[#2fd898]">
                        <span className="text-xs text-[#c2ffe6] font-semibold" style={{ fontFamily: 'var(--font-montserrat)', letterSpacing: 0.1 }}>
                            Blood Group:
                        </span>
                        <span className="ml-1 text-sm font-bold text-[#2fd898]" style={{ fontFamily: 'var(--font-montserrat)' }}>
                            {BLOOD_GROUP}
                        </span>
                    </div>
                </div>
                <div className="mt-1 w-full flex justify-center">
                    {/* Added flex, justify-center, and text-center to center content */}
                    <span className="text-xs text-[#FFD5B7] font-medium block break-words text-center" style={{ fontFamily: 'var(--font-montserrat)', letterSpacing: 0 }}>
                        <span className="font-bold text-[#ff9724]">Emergency Notes:</span>{" "}
                        <span>{EMERGENCY_NOTES}</span>
                    </span>
                </div>
            </div>


            {/* End Call Button */}
            {(callActive && !ringing) && (
                <button
                    aria-label="End Call"
                    className="mt-10 flex items-center justify-center bg-[#F33] w-16 h-16 rounded-full shadow-lg hover:bg-[#c81d1d] transition"
                    style={{
                        boxShadow: '0 5px 18px #F337',
                        border: 'none',
                        outline: 'none',
                    }}
                    onClick={handleEndCall}
                >
                    <Phone size={36} color="white" style={{ transform: "rotate(135deg)" }} />
                </button>
            )}



            {(!callActive && !ringing) && (
                <div className="mt-8">
                    <span className="text-base text-[#EEE] tracking-tight"
                        style={{
                            fontFamily: 'var(--font-montserrat)',
                            letterSpacing: 0.1
                        }}>
                        Thank you for using our service.
                    </span>
                </div>
            )}

            {/* Pulse animation with Tailwind keyframes */}
            <style jsx global>{`
                @keyframes pulse-slow {
                  0%, 100% { transform: scale(1); opacity: 0.7; }
                  50% { transform: scale(1.22); opacity: 1; }
                }
                .animate-pulse-slow {
                  animation: pulse-slow 1.4s infinite;
                }
            `}</style>
        </div>
    );
}