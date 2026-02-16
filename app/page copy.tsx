
"use client";
import React, { useState, useEffect } from 'react';
import { Device } from '@twilio/voice-sdk';
import axios from 'axios';

const buttonStyle: React.CSSProperties = {
  padding: '12px 28px',
  fontSize: '16px',
  color: '#fff',
  background: '#0070f3',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  marginTop: '16px',
  transition: 'background 0.2s',
};

const endButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: '#e32d2d',
};

const CallComponent = () => {
  const [device, setDevice] = useState<Device | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [toNumber, setToNumber] = useState('+923162177746');
  // 1. Get token from your backend
  const getToken = async () => {
    try {
      const res = await axios.get('https://scan4call-backend-service-419107861981.europe-west1.run.app/token'); // Your backend endpoint
      return res.data.token;
    } catch (err) {
      console.error('Error fetching token', err);
    }
  };

  // 2. Initialize Twilio Device
  const initDevice = async () => {
    const token = await getToken();
    if (!token) return;

    const device = new Device(token);
    console.log(device);


    device.on('ready', () => {
      console.log('Device is ready');
    });

    device.on('error', (err) => {
      console.error('Device error:', err);
    });

    device.on('disconnect', () => {
      console.log('Call disconnected');
      setIsCalling(false);
    });

    setDevice(device);
  };

  useEffect(() => {
    initDevice();
  }, []);

  // 3. Make the call
  const makeCall = async () => {
    if (!device) return;

    const params = {
      To: '+923162177746',
    };

    const connection = await device.connect(params as any);

    setIsCalling(true);
    console.log("connection", connection);
    connection.on('error', (err) => console.error('Connection error:', err));

    connection.on('accept', () => console.log('Call accepted'));
    connection.on('disconnect', () => {
      setIsCalling(false);
      console.log('Call ended');
    });
  };

  // 4. End the call
  const endCall = () => {
    device?.disconnectAll();
    setIsCalling(false);
  };

  return (
    <div>
      {!isCalling ? (
        <button onClick={makeCall} style={buttonStyle}>Call Phone</button>
      ) : (
        <button onClick={endCall} style={endButtonStyle}>End Call</button>
      )}
    </div>
  );
};

export default CallComponent;
