const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { alldown } = require('nayan-media-downloaders');

module.exports = {
  config: {
    name: "mp3",
    credits: "Nayan",
    prefix: true,
    aliases: ["audio"],
    permission: 0,
    description: "Convert video to MP3",
    usage: "/mp3 [URL] or reply to a video with /mp3",
    tags: ["media", "audio"],
  },
  start: async ({ event, api, config }) => {
    const chatId = event.msg.chat.id;
    const userId = event.msg.from.id;
    const msg = event.msg;
    const url = event.body;

    // Display waiting message
    const waitingMsg = await api.sendMessage(chatId, "⏳ Please wait while your request is being processed...");

    if (msg.reply_to_message && msg.reply_to_message.video) {
      const video = msg.reply_to_message.video;
      const videoFileId = video.file_id;

      try {
        const file = await api.getFile(videoFileId);
        const fileUrl = `https://api.telegram.org/file/bot${global.config.telegramBotToken}/${file.file_path}`;

        const mp3Path = path.join(
          __dirname,
          'Nayan',
          `Nayan_${Date.now()}.mp3`
        );

        const response = await fetch(fileUrl);
        const buffer = await response.buffer();
        fs.writeFileSync(mp3Path, buffer);

        // Delete waiting message and send the MP3 file
        await api.deleteMessage(chatId, waitingMsg.message_id);
        await api.sendAudio(chatId, mp3Path, {}, {
          filename: path.basename(mp3Path),
        });

        // Clean up
        fs.unlinkSync(mp3Path);
      } catch (error) {
        console.error('Error processing the video:', error);
        await api.deleteMessage(chatId, waitingMsg.message_id);
        api.sendMessage(chatId, "❌ An error occurred while processing the video.");
      }
    } else if (url) {
      try {
        console.log(url);
        const data = await alldown(url);

        if (data.status && data.data && data.data.audio) {
          const audioUrl = data.data.audio;
          const mp3Path = path.join(
            __dirname,
            'Nayan',
            `Nayan_${Date.now()}.mp3`
          );

          const response = await fetch(audioUrl);
          const buffer = await response.buffer();
          fs.writeFileSync(mp3Path, buffer);

          // Delete waiting message and send the MP3 file
          await api.deleteMessage(chatId, waitingMsg.message_id);
          await api.sendAudio(chatId, mp3Path, {}, {
            filename: path.basename(mp3Path),
          });

          // Clean up
          fs.unlinkSync(mp3Path);
        } else {
          await api.deleteMessage(chatId, waitingMsg.message_id);
          api.sendMessage(chatId, "❌ Failed to retrieve audio. Please check the URL or try again.");
        }
      } catch (error) {
        console.error('Error processing the URL:', error);
        await api.deleteMessage(chatId, waitingMsg.message_id);
        api.sendMessage(chatId, "❌ An error occurred while processing the URL.");
      }
    } else {
      await api.deleteMessage(chatId, waitingMsg.message_id);
      api.sendMessage(
        chatId,
        "❌ Usage error: Please reply to a video or provide a video URL.\n\nExample:\n- Reply to a video with `/mp3`\n- Use `/mp3 <video URL>`"
      );
    }
  },
};
