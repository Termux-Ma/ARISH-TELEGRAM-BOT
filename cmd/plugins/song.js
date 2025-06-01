const axios = require('axios');
const Youtube = require('youtube-search-api');
const { ytdown } = require('nayan-media-downloaders');

module.exports = {
  config: {
    name: "song",
    prefix: true,
    aliases: ["/group"],
    tags: ["Group"],
    credits: "Nayan",
  },
  start: async ({ event, api }) => {
    const chatId = event.msg.chat.id;
    const name = event.body;
    const msg = event.msg
    

    if (name) {
      await processSong(chatId, name, api, msg.message_id);
    } else {
      api.sendMessage(chatId, 'Please enter the name of the song you want to search:').then(() => {
        const userInputHandler = async (msg) => {
          const name = msg.text;
          await processSong(chatId, name, api, msg.message_id);
          api.off('message', userInputHandler);
        };

        api.on('message', userInputHandler);
      });
    }
  },
};

const processSong = async (chatId, name, api, replyToMessageId) => {
  console.log(name);

  const waitMsg = await api.sendMessage(chatId, 'Please wait while we fetch the song...');

  try {
    const keywordSearch = name;
    const searchData = await Youtube.GetListByKeyword(keywordSearch, false, 1);
    const videoId = searchData.items[0].id;
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const downloadData = await ytdown(url);
    console.log(downloadData);

    const res = downloadData;
    const title = res.data.title;
    const videoUrl = res.data.video;

    const vid = (
      await axios.get(videoUrl, { responseType: 'stream' })
    ).data;

    const replyMarkup = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Bot Owner', url: 'https://t.me/MOHAMMADNAYAN' }],
        ],
      },
    };

    await api.deleteMessage(chatId, waitMsg.message_id);
    await api.sendVideo(chatId, vid, {
      caption: title,
      parse_mode: 'Markdown',
      reply_to_message_id: replyToMessageId,
      ...replyMarkup,
    });
  } catch (error) {
    console.error('Error:', error);
    api.deleteMessage(chatId, waitMsg.message_id);
    api.sendMessage(chatId, 'An error occurred while processing your request.', { reply_to_message_id: replyToMessageId });
  }
};
