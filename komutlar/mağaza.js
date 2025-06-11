const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'mağaza',
    description: 'Mağaza kategorilerini gösterir.',
    execute(message) {
        const categories = {
            "Araçlar": [
                "Eski Model Araba - 20000$",
                "Standart Araba - 30000$",
                "Motosiklet - 18000$",
                "Spor Araba - 45000$"
            ],
            "Evler": [
                "**1+0 Apartman - 50000$**",
                "**1+1 Apartman - 60000$**",
                "**2+1 Apartman - 70000$**",
                "**3+1 Apartman - 80000$**",
                "**Müstakil Ev - 100000$**",
                "**Dublex Ev - 150000$**",
                "**Orman Evi - 125000$**",
                "**Dağ Evi - 100000$**",
                "**Villa - 200000$**",
                
            ],
            "Doğaüstü Silahlar ve Aletler": [
                "**Normal Mermi - 500$**\n> Standart mühimmat. Doğaüstü varlıklara geçici etki.",
                "**Gümüş Mermi - 7500$**\n> Kurtadamlar için ölümcül. Zehir etkili.",
                "**Kurtboğan - 1500$**\n> Doğaüstü varlıklara acı ve zayıflık verir.",
                "**Kurtboğanlı Mermi - 7500$**\n> Kurtadamları iyileşemez hale getirir.",
                "**Kurtboğanlı Gaz Bombası - 7500$**\n> Alan etkili. Nefes keser, yavaşlatır.",
                "**Elektrikli Şok Cihazı - 5000$**\n> Kas kontrolünü geçici durdurur.",
                "**Dağ Külü (5 kişilik) - 10000$**\n> Kitsune ve ruhani varlıklara karşı bariyer sağlar.",
                "**Kurşun Tuzakları - 2500$**\n> Fiziksel zarar. İzinsiz girişe karşı savunma.",
                "**Zincirler - 1500$**\n> Esir alma. Özel materyalli olabilir.",
                "**Kurtboğanlı İğne - 3000$**\n> Sessiz ve zayıflatıcı saldırı.",
                "**Zayıf Noktalar Kitabı - 15000$**\n> Tüm türlerin zayıflıkları.",
                "**Işıklı Tuzak - 2500$**\n> Düşman yaklaşınca sinyal verir.",
                "**Triskelion - 12000$**\n> Beta kurtlar için denge aracı.",
                "**Druid Ritüel Kitabı - 10000$**\n> Koruma büyüleri ve ayinler.",
                "**Bestiary - 8000$**\n> Doğaüstü varlıkların detaylı bilgisi.",
                "**Banshee Günlüğü - 5000$**\n> Yaklaşan ölümlerin sezgileri."
            ],
            "Klasik ve Modern Silahlar": [
                "**Tabanca - 10000$**\n> Hafif, hızlı müdahale için.",
                "**Yay - 30000$**\n> Sessiz saldırılar için.",
                "**Arbalet - 30000$**\n> Güçlü ve isabetli.",
                "**Ok - 500$**\n> Zehirli/kutsal türleri mevcuttur.",
                "**Kılıç/Katana - 12000$**\n> Yakın dövüş. Özel güçlü olabilir.",
                "**Tüfek - 40000$**\n> Uzak menzil, yüksek hasar.",
                "**Pompalı Tüfek - 40000$**\n> Yakın mesafe yıkım.",
                "**Makineli - 50000$**\n> Seri atış, kalabalık hedefler."
            ],
            "Takılar": [
                "Gün Işığı Takıları - 1000$",
                "Ay Işığı Takıları - 2000$",
                "Gilbert Yüzüğü - 2500$"
            ]
        };

        const categoryImages = {
            "Araçlar": "https://i.imgur.com/5NjHuR0.gif",
            "Evler": "https://link-to-your-image.com/evler.jpg",
            "Doğaüstü Silahlar ve Aletler": "https://link-to-your-image.com/supernatural.jpg",
            "Klasik ve Modern Silahlar": "https://link-to-your-image.com/weapons.jpg",
            "Takılar": "https://link-to-your-image.com/takilar.jpg"
        };

        const options = Object.keys(categories).map(category => ({
            label: category,
            description: `${category} ürünlerini görüntüle.`,
            value: category
        }));

        const embed = new MessageEmbed()
            .setTitle("Mağaza Menüsü")
            .setDescription("Bir kategori seçerek o kategoriye ait ürünleri görebilirsiniz.")
            .setColor("BLUE")
            .setFooter("Mağaza | Seçim yapmak için menüyü kullanın.");

        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId('mağaza_menu')
                .setPlaceholder('Kategori seçin...')
                .addOptions(options)
        );

        message.channel.send({ embeds: [embed], components: [row] });

        const filter = interaction => interaction.customId === 'mağaza_menu' && interaction.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', interaction => {
            const category = interaction.values[0];
            const products = categories[category].join('\n\n');

            const categoryEmbed = new MessageEmbed()
                .setTitle(category)
                .setDescription(products || "Bu kategoride ürün bulunmuyor.")
                .setColor("GREEN")
                .setImage(categoryImages[category] || null);

            interaction.update({ embeds: [categoryEmbed] });
        });

        collector.on('end', () => {
            message.channel.send("🕒 Mağaza menüsü süresi doldu. Tekrar kullanmak için `.mağaza` yazın.");
        });
    }
};
