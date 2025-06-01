const axios = require('axios');
const { alldown } = require('nayan-media-downloaders');

module.exports = {
  config: {
    name: "alldown",
    credits: "Nayan",
    aliases: ["alldl", "dl", "down"],
    prefix: "auto",
    permission: 0,
    description: "Download Video",
    tags: ["media"],
  },
  start: async ({ event, api, config }) => {
    try {
      const chatId = event.message.chat.id;
      const msg = event.message;
      const inputText = event.body;

      if (!inputText) {
        await api.sendMessage(
          chatId,
          '❌ Input Link! Example: /alldl <link>',
          { reply_to_message_id: msg.message_id }
        );
        return;
      }

      const waitMsg = await api.sendMessage(chatId, '⏳ Processing your request...', {
        reply_to_message_id: msg.message_id,
      });

      const apis = await alldown(inputText);
      const { high, title } = apis.data;

      const caption = `🎬 *Title:* ${title}`;
      const vid = (
        await axios.get(high, { responseType: 'stream' })
      ).data;

      const replyMarkup = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔗 Bot Owner', url: 'https://t.me/MOHAMMADNAYAN' }],
          ],
        },
      };

      await api.deleteMessage(chatId, waitMsg.message_id); // Delete wait message
      await api.sendVideo(chatId, vid, {
        caption: caption,
        parse_mode: 'Markdown',
        reply_to_message_id: msg.message_id,
        ...replyMarkup,
      });
    } catch (error) {
      console.error('Error:', error.message);
      await api.sendMessage(
        chatId,
        '❌ An error occurred while processing your request.',
        { reply_to_message_id: event.message.message_id }
      );
    }
  },
};
