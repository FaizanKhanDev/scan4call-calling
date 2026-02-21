import { twiml as TwilioTwiml } from 'twilio';

let myTwilioNumber = '+16268871097';

export async function POST(req) {
    const response = new TwilioTwiml.VoiceResponse();
    const formData = await req.formData();
    const targetNumber = formData.get('To');

    if (!targetNumber) {
        return new Response("Missing 'To' number", { status: 400 });
    }

    // Initialize dial with the callerId
    const dial = response.dial({ callerId: myTwilioNumber });

    // Use .number() to specify the target AND the statusCallback attributes
    dial.number({
        statusCallback: 'https://scan4call-calling.vercel.app',
        statusCallbackEvent: 'initiated ringing answered completed',
        statusCallbackMethod: 'POST'
    }, targetNumber);

    return new Response(response.toString(), {
        headers: { 'Content-Type': 'text/xml' },
    });
}

// Update GET handler similarly
export async function GET(req) {
    const response = new TwilioTwiml.VoiceResponse();
    const url = new URL(req.url);
    const targetNumber = url.searchParams.get('To');

    if (!targetNumber) {
        return new Response("Missing 'To' number", { status: 400 });
    }

    const dial = response.dial({ callerId: myTwilioNumber });
    dial.number({
        statusCallback: 'https://scan4call-calling.vercel.app',
        statusCallbackEvent: 'initiated ringing answered completed',
        statusCallbackMethod: 'POST'
    }, targetNumber);

    return new Response(response.toString(), {
        headers: { 'Content-Type': 'text/xml' },
    });
}
