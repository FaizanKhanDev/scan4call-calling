'use client';

import { Phone, Shield, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function Scan4CallContact() {
    const [phoneNumber, setPhoneNumber] = useState('');

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-sm">
                {/* Header Section */}
                <div className="relative rounded-t-3xl bg-gradient-to-r from-[#0052CC] to-[#00BCD4] px-6 py-8 text-center text-white overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-2 right-10 w-2 h-2 bg-white rounded-full opacity-40"></div>
                    <div className="absolute top-8 right-32 w-1 h-1 bg-white rounded-full opacity-30"></div>
                    <div className="absolute bottom-4 left-10 w-1.5 h-1.5 bg-white rounded-full opacity-20"></div>

                    {/* Logo from public/logo.png & logotext.png */}
                    <div className="flex items-center justify-center  mb-2">
                        <div className="bg-white  p-1 flex items-center justify-center">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="w-8 h-8"
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                        <div className="bg-white  p-1 flex items-center justify-center">
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
                <div className="bg-white rounded-b-3xl shadow-lg px-6 py-8">
                    {/* Title */}
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-6 text-center">
                        Contact vehicle owner
                    </h2>

                    {/* Phone Input */}
                    <div className="mb-4 p-4 rounded-2xl border-2 border-[#00BCD4] bg-gradient-to-r from-[#F0FBFF] to-[#E0F7FF]">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#00897B] text-white rounded-lg p-2 flex items-center justify-center">
                                <Phone className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="bg-transparent text-gray-700 font-medium text-lg outline-none w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Call Buttons */}
                    <button className="w-full bg-gradient-to-r from-[#52C77F] to-[#4CAF50] text-white font-semibold py-4 rounded-2xl mb-4 flex items-center justify-center gap-2 hover:shadow-lg transition-shadow">
                        <Phone className="w-5 h-5" />
                        Call Vehicle Owner
                    </button>
                    <button className="w-full bg-gradient-to-r from-[#FF8A65] to-[#FF5252] text-white font-semibold py-4 rounded-2xl mb-6 flex items-center justify-center gap-2 hover:shadow-lg transition-shadow">
                        <AlertTriangle className="w-5 h-5" />
                        Emergency Contact
                    </button>

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
