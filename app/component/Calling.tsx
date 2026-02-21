import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "querystring"; // Node built-in

export const config = {
    api: {
        bodyParser: false, // Disable default parser to handle form-urlencoded manually
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            res.status(405).send("Method Not Allowed");
            return;
        }

        // Collect raw POST data
        const buffers: Uint8Array[] = [];
        for await (const chunk of req) {
            buffers.push(chunk);
        }
        const rawBody = Buffer.concat(buffers).toString("utf-8");

        // Parse x-www-form-urlencoded body
        const body = parse(rawBody);
        let dialTo = body.dialTo?.toString() || "+923001234567"; // fallback

        // Remove 'client:' if present
        dialTo = dialTo.replace(/^client:/, "");

        const callerId = "+16268871097"; // your Twilio number

        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial callerId="${callerId}">
        <Number>${dialTo}</Number>
    </Dial>
</Response>`;

        res.status(200).setHeader("Content-Type", "text/xml").send(twiml);
    } catch (err) {
        console.error("Twiml handler error:", err);
        res.status(500).send("Internal Server Error");
    }
}