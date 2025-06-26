const { MessageEmbed } = require('discord.js');
const Words = require('../models/Words');
const Balance = require('../models/Balance');
const trackPartnerMessage = require('../utils/partner');

const prefix = '.';
const arcaneBotId = '437808476106784770';
const fiboBotId = '735147814878969968';
const excludedChannels = ['1327621148606988349', '1327625994411970560'];
const notificationChannelId = '1327609643853156362';
const rewardPer1000 = 3000;

module.exports = async (client, message) => {
    // Eğer mesaj bot'tan geldiyse veya hariç tutulan kanallardaysa işlem yapma
    if (message.author.bot || excludedChannels.includes(message.channel.id)) return;

    // 📌 PARTNER MESAJ TAKİBİ
    trackPartnerMessage(message);

    // 📌 FIBO BUMP ÖDÜLÜ
    if (
        message.author.id === fiboBotId &&
        message.content.includes('Thx for bumping our Server!')
    ) {
        const bumpedUser = message.mentions.users.first();
        if (bumpedUser) {
            await addBalance(bumpedUser.id, 100);
            const embed = new MessageEmbed()
                .setTitle('Sunucu Bump Ödülü!')
                .setDescription(`🎉 Tebrikler ${bumpedUser.username}! Sunucuyu bump'ladığın için **100$** kazandın!`)
                .setColor('#F5A623')
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
        }
    }

    // 📌 ARCANE LEVEL ÖDÜLÜ
    if (
        message.author.id === arcaneBotId &&
        message.content.includes('Yeni levelin')
    ) {
        const userIdMatch = message.content.match(/<@!?(\d+)>/);
        const levelMatch = message.content.match(/Yeni levelin \*\*(\d+)\*\*/i);

        if (userIdMatch && levelMatch) {
            const userId = userIdMatch[1];
            const level = parseInt(levelMatch[1], 10);

            const arcaneRewardTable = {
                '5-10': 200,
                '10-25': 300,
                '25-200': 500,
            };

            let reward = 0;
            for (const [range, amount] of Object.entries(arcaneRewardTable)) {
                const [min, max] = range.split('-').map(Number);
                if (level >= min && level <= max) {
                    reward = amount;
                    break;
                }
            }

            if (reward > 0) {
                await addBalance(userId, reward);

                const embed = new MessageEmbed()
                    .setTitle('Arcane Seviye Ödülü!')
                    .setDescription(`Tebrikler <@${userId}>! Arcane'de seviye **${level}** oldun ve **${reward}$** kazandın!`)
                    .setColor('#00ff00')
                    .setTimestamp();
                message.channel.send({ embeds: [embed] });
            }
        }
    }

    // 📌 KELİME SAYMA ve SEVİYE HESAPLAMA
    let wordData = await Words.findById(message.author.id);

    if (!wordData) {
        wordData = new Words({
            _id: message.author.id,
            words: 0,
            lastLevel: 0
        });
    }

    const wordCount = message.content.trim().split(/\s+/).length;
    wordData.words += wordCount;

    const currentLevel = Math.floor(wordData.words / 1000);
    if (currentLevel > (wordData.lastLevel || 0)) {
        await addBalance(message.author.id, rewardPer1000);

        const channel = client.channels.cache.get(notificationChannelId);
        if (channel) {
            const embed = new MessageEmbed()
                .setTitle('Seviye Atlama Ödülü!')
                .setDescription(`🎉 <@${message.author.id}>! **${currentLevel}. seviye** oldun ve **${rewardPer1000}$** kazandın!`)
                .setColor('#FFD700')
                .setTimestamp();
            channel.send({ content: `<@${message.author.id}>`, embeds: [embed] });
        }

        wordData.lastLevel = currentLevel;
    }

    await wordData.save();

    // 📌 PREFIX KOMUTLARI (.komut şeklindeki)
    // Buraya prefix komutlar için kontrol eklenebilir
};

// 💰 MONGODB BAKİYE EKLEME FONKSİYONU
async function addBalance(userId, amount) {
    try {
        let userBalance = await Balance.findById(userId);
        if (!userBalance) {
            userBalance = new Balance({ _id: userId, balance: 0, bank: 0 });
        }

        userBalance.balance += amount;
        await userBalance.save();
    } catch (err) {
        console.error('Bakiye eklenirken hata oluştu:', err);
    }
}
