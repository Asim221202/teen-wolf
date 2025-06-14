const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'guildMemberUpdate',
    execute(oldMember, newMember) {
        // Eğer eski durumda premium yoksa ve yeni durumda varsa, boost atılmış demektir.
        if (!oldMember.premiumSince && newMember.premiumSince) {
            // 3 saniye gecikme ekleyerek boost işleminin gerçekten tamamlanmasını bekleyelim
            setTimeout(() => {
                const boosterRoleID = "1370821728778846328"; // Booster rolü ID'si
                const boosterChannelID = "1368538996631670867"; // Boost teşekkür mesajının gideceği kanal ID'si
                const channel = newMember.guild.channels.cache.get(boosterChannelID);
                
                if (!channel) return;

                const embed = new MessageEmbed()
                    .setColor("#8B0000") // Kan kırmızısı
                    .setTitle("➝ 𝗝𝗢𝗜𝗡.𝗚𝗚/𝗧𝗛𝗘𝗢𝗧𝗛𝗘𝗥𝗦𝗜𝗗𝗘")
                    .setDescription(`
                        **𝐓𝐄𝐒̧𝐄𝐊𝐊𝐔̈𝐑𝐋𝐄𝐑, 𝐁𝐎𝐎𝐒𝐓𝐄𝐑!** <@${newMember.id}>  
                        *The Other Side'a takviye yaptığın için teşekkür ederiz!  
                        Özel ayrıcalıklar ve ödüller kazandın!*  
                        ** 𝐀𝐘𝐑𝐈𝐂𝐀𝐋𝐈𝐊 𝐁𝐈𝐋𝐆𝐈𝐋𝐄𝐑𝐈:**  
                        - <#1368538996631670868>  
                    `)
                    .setImage("https://cdn.discordapp.com/attachments/1368538992257273993/1383067720601440320/IMG_5285.gif")
                    .setFooter(`Şu anki boost sayısı: ${newMember.guild.premiumSubscriptionCount}`);

                channel.send({ content: `<@${newMember.id}>`, embeds: [embed] });
            }, 3000); // 3 saniye gecikme ekledik
        }
    }
};
