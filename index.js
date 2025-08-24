const axios = require('axios');

const apiUrl = 'https://api.noire.my.id/api';
const webhookUrl = '';

const statusEmoji = {
    Online: '<:online_badge:1408830118092345434>', 
    Offline: '<:orange_dot:1408830083157721139>', 
    Undercover: '<:dnd_badge:1408830103701684376>' 
};

let sendCount = 0;

async function trackMods() {
    try {
        const res = await axios.get(apiUrl, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = res.data;
        const modsOnline = data.modData.mods;

        const newDate = new Date();

        const payload = {
            embeds: [
                {
                    color: Math.floor(Math.random() * 16777216),
                    fields: [
                        {
                            name: "Mods Online",
                            value: modsOnline.length > 0
                                ? modsOnline.map(m => {
                                    let updated = m.updated && Number.isInteger(m.updated) 
                                        ? `<t:${m.updated}:R>` 
                                        : "N/A";
                                    return `${statusEmoji[m.status] || '⚪'} **${m.name || 'Unknown'}** • ${m.status} • ${updated}`;
                                }).join("\n")
                                : "Tidak ada mod online.",
                            inline: false
                        }
                    ],
                    footer: {
                        text: `Last Update - ${newDate.toLocaleString('id-ID', {
                            timeZone: 'Asia/Jakarta'
                        })}`
                    }
                }
            ]
        };

        await axios.post(webhookUrl, payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        sendCount++;
        console.log(`✅ Webhook terkirim: ${sendCount}x`);
    } catch (err) {
        console.error("❌ Error:", err.response?.data || err.message);
    }
}

console.log("⏳ Waiting for sec....");
setInterval(trackMods, 10000);

process.on('SIGINT', () => {
    console.log(`‼️ Stopped!, total webhook terkirim: ${sendCount}x`);
    process.exit(0);
});