const { text2voice } = require("nayan-api-servers");
const path = require("path");

module.exports = {
  config: {
    name: "say",
    credits: "Nayan",
    prefix: true,
    aliases: ["speech"],
    permission: 0,
    description: "Convert text to speech and send audio",
    tags: ["Utility"],
  },
  start: async ({ event, api }) => {
    const chatId = event.msg.chat.id;
    const msg = event.msg; 
    const command = event.body;

    let text;
    if (msg.reply_to_message && msg.reply_to_message.text) {
      text = msg.reply_to_message.text;
    } else {
      text = command.split(' ').slice(1).join(' ');
    }

    if (!text) {
      return api.sendMessage(chatId, "Reply with text, then type /say or /speech after the command.", {
        reply_to_message_id: msg.message_id,
      });
    }

    const nameSelectionMarkup = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Nabanita', callback_data: 'Nabanita' },
            { text: 'Tanisha', callback_data: 'Tanisha' },
          ],
          [
            { text: 'Pradeep', callback_data: 'Pradeep' },
            { text: 'Bashkar', callback_data: 'Bashkar' },
          ],
        ],
      },
    };

    const waitMsg = await api.sendMessage(chatId, "Select a Voicer Name:", nameSelectionMarkup);

    api.once('callback_query', async (callbackQuery) => {
      if (callbackQuery.message.chat.id !== chatId) return;

      const name = callbackQuery.data;
      await api.deleteMessage(chatId, waitMsg.message_id);

      const filePath = path.join(__dirname, "voice", `${name}.mp3`);
      const waitVoiceMsg = await api.sendMessage(chatId, "Please wait...", {
        reply_to_message_id: msg.message_id,
      });

      try {
        const data = await text2voice(text, name, filePath);
        console.log(data);

        const replyMarkup = {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Bot Owner', url: 'https://t.me/MOHAMMADNAYAN' }],
            ],
          },
        };

        
        await api.sendAudio(chatId, data.filePath, {
          caption: `🎙️ *Voice by ${name}*\n\nGenerated from text: "${text}"`,
          reply_to_message_id: msg.message_id,
          ...replyMarkup,
        });
        await api.deleteMessage(chatId, waitVoiceMsg.message_id);
      } catch (error) {
        await api.deleteMessage(chatId, waitVoiceMsg.message_id);
        console.error('Error generating audio:', error);
        api.sendMessage(chatId, "❌ An error occurred while generating the audio.", {
          reply_to_message_id: msg.message_id,
        });
      }
    });
  },
};
