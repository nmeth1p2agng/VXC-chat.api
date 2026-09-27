const { Redis } = require("@upstash/redis");

const redis = Redis.fromEnv();

const KEY = "roblox:chat:messages";

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 500;

function response(data, status = 200) {

    return new Response(
        JSON.stringify(data),
        {
            status,

            headers: {
                "Content-Type":
                    "application/json",

                "Access-Control-Allow-Origin":
                    "*",

                "Access-Control-Allow-Methods":
                    "GET, POST, OPTIONS",

                "Access-Control-Allow-Headers":
                    "Content-Type"
            }
        }
    );

}


// ==========================================
// OPTIONS
// ==========================================

export async function OPTIONS() {

    return response(
        null,
        204
    );

}


// ==========================================
// GET
// ==========================================

export async function GET() {

    try {

        const messages =
            await redis.lrange(
                KEY,
                0,
                MAX_MESSAGES - 1
            );

        return response({

            success: true,

            data:
                messages || []

        });

    }

    catch (error) {

        console.error(error);

        return response({

            success: false,

            error:
                "Redis GET failed"

        }, 500);

    }

}


// ==========================================
// POST
// ==========================================

export async function POST(request) {

    try {

        const body =
            await request.json();

        const data =
            body?.data || body;

        if (!data) {

            return response({

                success: false,

                error:
                    "Missing data"

            }, 400);

        }


        let message =
            String(
                data.message || ""
            ).trim();


        let author =
            String(
                data.author || ""
            ).trim();


        let userId =
            String(
                data.userId || ""
            ).trim();


        let timestamp =
            Number(
                data.timestamp || 0
            );


        if (!message) {

            return response({

                success: false,

                error:
                    "Message is empty"

            }, 400);

        }


        if (
            message.length >
            MAX_MESSAGE_LENGTH
        ) {

            return response({

                success: false,

                error:
                    "Message too long"

            }, 400);

        }


        if (!timestamp) {

            timestamp =
                Math.floor(
                    Date.now() / 1000
                );

        }


        const id =
            `${timestamp}-${crypto.randomUUID()}`;


        const newMessage = {

            id:

                id,

            message:

                message,

            author:

                author,

            userId:

                userId,

            timestamp:

                timestamp

        };


        await redis.lpush(

            KEY,

            JSON.stringify(
                newMessage
            )

        );


        await redis.ltrim(

            KEY,

            0,

            MAX_MESSAGES - 1

        );


        return response({

            success: true,

            data:
                newMessage

        });

    }

    catch (error) {

        console.error(error);

        return response({

            success: false,

            error:
                "Redis POST failed"

        }, 500);

    }

}
