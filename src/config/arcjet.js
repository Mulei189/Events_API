import arcjet, {shield, detectBot, slidingWindow} from '@arcjet/node';

const aj = arcjet({
    key: process.env.ARCJET_KEY,
    rules: [
        // Shield rule to block common attacks
        shield ({
            mode: "LIVE"
        }),
        // Bot detection rule
        detectBot({
            mode: "LIVE",
            allow: [
                "CATEGORY: SEARCH_ENGINE",
                "CATEGORY: PREVIEW"
            ]
        }),
        // Sliding window rate limiting rule
        slidingWindow({
            mode: "LIVE",
            interval: '2s',
            max: 5
        })
    ]
});

export default aj;