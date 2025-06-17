const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');
const cron = require('node-cron');

const KANAL_ID = '1383822193087086623'; // Ay embed'inin atılacağı kanal
let panoMesajId = null;

function getSonrakiCumartesiSaat21(reference) {
  const cumartesi = reference.clone().day(6).hour(21).minute(0).second(0).millisecond(0);
  while (cumartesi.isBefore(reference)) {
    cumartesi.add(14, 'days');
  }
  return cumartesi;
}

function getOncekiCumartesiSaat21(reference) {
  const cumartesi = reference.clone().day(6).hour(21).minute(0).second(0).millisecond(0);
  while (cumartesi.isAfter(reference)) {
    cumartesi.subtract(14, 'days');
  }
  return cumartesi;
}

function getAyEvresi() {
  const now = moment().tz("Europe/Istanbul");

  const dolunayBaslangic = getOncekiCumartesiSaat21(now); // En son dolunay Cumartesi 21:00
  const dolunayBitis = dolunayBaslangic.clone().add(1, 'days').hour(23).minute(59).second(59); // Pazar 23:59
  const sonrakiDolunay = dolunayBaslangic.clone().add(14, 'days'); // Sonraki dolunay

  let oran = 0;

  if (now.isBetween(dolunayBaslangic, dolunayBitis, null, '[]')) {
    oran = 100;
  } else if (now.isAfter(dolunayBitis) && now.isBefore(sonrakiDolunay)) {
    oran = 0; // Dolunay bitti, oran sıfırlandı
  } else if (now.isBefore(dolunayBaslangic)) {
    const oncekiDolunay = dolunayBaslangic.clone().subtract(14, 'days');
    const toplamMs = dolunayBaslangic.diff(oncekiDolunay);
    const gecenMs = now.diff(oncekiDolunay);
    oran = Math.floor(100 * (gecenMs / toplamMs));
  }

  oran = Math.max(0, Math.min(100, oran));

  let kalanMs = sonrakiDolunay.diff(now);
  if (kalanMs < 0) kalanMs = 0;

  const kalanGün = Math.floor(kalanMs / (1000 * 60 * 60 * 24));
  const kalanSaat = Math.floor((kalanMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const kalanText = `${kalanGün} gün ${kalanSaat} saat`;

  let yazı;
  if (oran === 100) yazı = "Dolunay 🌕";
  else if (oran === 0) yazı = "Yeni Ay 🌑";
  else yazı = `Ay Işığı: ${oran} / 100`;

  return {
    ışık: oran,
    yazı,
    kalan: `Bir sonraki dolunaya: ${kalanText}`
  };
}

function ayEmbedOlustur() {
  const ay = getAyEvresi();
  const simdi = moment().tz("Europe/Istanbul").format("DD MMMM YYYY HH:mm");

  const embed = new MessageEmbed()
    .setTitle("🌙 Ay Durumu ve Pano Sistemi")
    .addField("Ay Evresi", ay.yazı, true)
    .addField("Dolunay Oranı", `%${ay.ışık}`, true)
    .addField("Süre", ay.kalan, true)
    .addField("Güncellendi", simdi, false)
    .setColor("#8e44ad");

  return { embed, ay };
}

function ayPanoGuncelle(client) {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const kanal = await client.channels.fetch(KANAL_ID);
      if (!kanal || kanal.type !== 'GUILD_TEXT') {
        console.error('Metin kanalı bulunamadı veya türü uyumsuz.');
        return;
      }

      const { embed } = ayEmbedOlustur();

      if (panoMesajId) {
        const eskiMesaj = await kanal.messages.fetch(panoMesajId).catch(() => null);
        if (eskiMesaj) {
          await eskiMesaj.edit({ embeds: [embed] });
        } else {
          const yeniMesaj = await kanal.send({ embeds: [embed] });
          panoMesajId = yeniMesaj.id;
        }
      } else {
        const mesajlar = await kanal.messages.fetch({ limit: 10 });
        const onceki = mesajlar.find(m => m.embeds.length && m.embeds[0].title === "🌙 Ay Durumu ve Pano Sistemi");

        if (onceki) {
          panoMesajId = onceki.id;
          await onceki.edit({ embeds: [embed] });
        } else {
          const yeniMesaj = await kanal.send({ embeds: [embed] });
          panoMesajId = yeniMesaj.id;
        }
      }
    } catch (err) {
      console.error("Pano mesajı güncellenirken hata:", err);
    }
  }, {
    timezone: "Europe/Istanbul"
  });
}

module.exports = {
  getAyEvresi,
  ayEmbedOlustur,
  ayPanoGuncelle
};
