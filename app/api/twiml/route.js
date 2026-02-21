import { twiml as TwilioTwiml } from "twilio";

export async function GET(req) {
    const { searchParams } = new URL(req.url);

    const from = searchParams.get("From");
    const to = searchParams.get("To");

    console.log("Incoming call from:", from);
    console.log("To:", to);

    const response = new TwilioTwiml.VoiceResponse();

    response.say("Hello. Connecting your call.");
    response.dial({ callerId: myTwilioNumber }, to);

    return new Response(response.toString(), {
        headers: {
            "Content-Type": "text/xml",
        },
    });
}