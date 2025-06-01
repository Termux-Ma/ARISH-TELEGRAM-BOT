
const path = require('path');
const { alldown } = require("nayan-media-downloaders");
const axios = require("axios")

module.exports = {
  event: 'message',
  handle: async ({ msg, bot }) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text && (text.match(/^https:\/\/teraboxapp\.com\/.*/) || 
                 text.match(/^https:\/\/1024terabox\.com\/.*/) || 
                 text.match(/^https:\/\/terabox\.com\/.*/))) {
      return;
    }

    if (text && text.startsWith("https://")) {
      const waitMsg = await bot.sendMessage(chatId, "Please wait...", { reply_to_message_id: msg.message_id });

      try {
        const data = await alldown(text);
        console.log(data);

        const { high, title } = data.data;
        
        const vid = (
          await axios.get(high, { responseType: 'stream' })
        ).data;

        const replyMarkup = {
          inline_keyboard: [
            [{ text: 'Bot Owner', url: 'https://t.me/MOHAMMADNAYAN' }],
            [{ text: 'Download', url: high }],
          ],
        };

        await bot.sendVideo(chatId, vid, { 
          caption: title, 
          reply_to_message_id: msg.message_id, 
          reply_markup: replyMarkup  
        });

        await bot.deleteMessage(chatId, waitMsg.message_id);

      } catch (error) {
        console.log(error)
        await bot.deleteMessage(chatId, waitMsg.message_id);
        await bot.sendMessage(chatId, "Failed to download the file. Please check the URL and try again.");
      }
    }
  },
};
