import { twiml as TwilioTwiml } from 'twilio';

// The number you want to call
let phoneNumber = '+923162177746';
// YOUR Twilio trial number (must include '+')
let myTwilioNumber = '+16268871097';

export async function POST(req) {
    const response = new TwilioTwiml.VoiceResponse();
    const formData = await req.formData();
    const targetNumber = formData.get('To');


  

    // Add the callerId here inside an object
    response.dial({ callerId: myTwilioNumber }, phoneNumber);

    return new Response(response.toString(), {
        headers: { 'Content-Type': 'text/xml' },
    });
}

// Update GET handler as well
export async function GET(req) {
    const response = new TwilioTwiml.VoiceResponse();
    const targetNumber = req.url.includes('To=')
        ? new URL(req.url).searchParams.get('To')
        : null;

    if (!targetNumber) {
        return new Response("Missing 'To' number", { status: 400 });
    }
    response.dial({ callerId: myTwilioNumber }, phoneNumber);

    return new Response(response.toString(), {
        headers: { 'Content-Type': 'text/xml' },
    });
}
