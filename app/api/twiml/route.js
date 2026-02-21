import { twiml as TwilioTwiml } from "twilio";

const myTwilioNumber = "+16268871097";

// List of verified numbers for trial account
const verifiedNumbers = ["+923001234567", "+1234567890"]; // replace with your verified numbers

export async function POST(req) {
    const response = new TwilioTwiml.VoiceResponse();
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    const targetNumber = params.get("To") || params.get("dialTo");

    if (!targetNumber) {
        // No number provided
        response.say("No phone number was provided. Call cannot be completed.");
    } else if (!verifiedNumbers.includes(targetNumber)) {
        // Trial account: number is not verified
        response.say(
            "The number you are trying to call is not verified. Trial accounts can only call verified numbers."
        );
    } else {
        // Number is valid and verified
        response.dial({ callerId: myTwilioNumber }).number(targetNumber);
    }

    return new Response(response.toString(), {
        headers: { "Content-Type": "text/xml" },
    });
}