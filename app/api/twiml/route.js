import { twiml as TwilioTwiml } from "twilio";

const myTwilioNumber = "+16268871097"; 

export async function POST(req) {
    const response = new TwilioTwiml.VoiceResponse();
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    const targetNumber = params.get("To") || params.get("dialTo");
    response.dial({ callerId: myTwilioNumber }).number("+923162177746");
    return new Response(response.toString(), {
        headers: { "Content-Type": "text/xml" },
    });
}
