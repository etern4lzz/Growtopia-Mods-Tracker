const axios = require('axios');

const apiUrl = '';
const webhookUrl = '';
const [ webhookId, webhookToken ] = webhookUrl.split('/').slice(-2);

const statusEmoji = {
    Online: '<:online_badge:1409052165003022387>',
    Undercover: '<:dnd_badge:1409052037278208101>'
};

let sendCount = 0;
let messageId = null;

async function trackMods() {
    try {
        const res = await axios.get(apiUrl, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
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
                                    return `${statusEmoji[m.status] || '⚪'} **${m.name || 'Unknown'}** (${m.status}) • ${updated}`;
                                }).join("\n")
                                : "<:info:1409553599155146872> Tidak ada mod online.",
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

        if (!messageId) {
            // Kirim pertama kali
            const sendRes = await axios.post(`${webhookUrl}?wait=true`, payload, {
                headers: { 'Content-Type': 'application/json' }
            });
            messageId = sendRes.data.id;
            console.log(`📩 Pesan inisiasi dikirim, ID: ${messageId}`);
        } else {
            // Update pesan lama
            await axios.patch(
                `https://discord.com/api/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`,
                payload,
                { headers: { 'Content-Type': 'application/json' } }
            );
        }

        sendCount++;
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