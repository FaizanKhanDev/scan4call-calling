import { twiml as TwilioTwiml } from "twilio";

const myTwilioNumber = "+16268871097"; // your Twilio number

export async function POST(req) {
    const response = new TwilioTwiml.VoiceResponse();
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    const targetNumber = params.get("To") || params.get("dialTo");
    response.dial({ callerId: myTwilioNumber }).number(targetNumber);
    return new Response(response.toString(), {
        headers: { "Content-Type": "text/xml" },
    });
}


export async function GET(req) {
    const response = new TwilioTwiml.VoiceResponse();
    const url = new URL(req.url);
    const targetNumber = url.searchParams.get("dialTo");

    if (!targetNumber) {
        return new Response("Missing 'dialTo' number", { status: 400 });
    }

    // Validate E.164 number
    if (!/^\+?\d{10,15}$/.test(targetNumber)) {
        return new Response("Invalid phone number format", { status: 400 });
    }

    response.dial({ callerId: myTwilioNumber }).number(targetNumber);

    return new Response(response.toString(), {
        headers: { "Content-Type": "text/xml" },
    });
}