import { twiml as TwilioTwiml } from 'twilio';

const myTwilioNumber = '+16268871097';

export async function POST(req) {
    const response = new TwilioTwiml.VoiceResponse();
    
    // Try to get 'dialTo' from URL params first, then from the body
    const url = new URL(req.url);
    let targetNumber = url.searchParams.get('dialTo');

    if (!targetNumber) {
        const formData = await req.formData();
        targetNumber = formData.get('dialTo');
    }

    if (!targetNumber) {
        return new Response("Missing 'dialTo' number", { status: 400 });
    }

    const dial = response.dial({ callerId: myTwilioNumber });
    
    // Crucial: Use .number() to apply the statusCallback
    dial.number({
        statusCallback: 'https://scan4call-calling.vercel.app',
        statusCallbackEvent: 'initiated ringing answered completed',
        statusCallbackMethod: 'POST'
    }, targetNumber);

    return new Response(response.toString(), {
        headers: { 'Content-Type': 'text/xml' },
    });
}
