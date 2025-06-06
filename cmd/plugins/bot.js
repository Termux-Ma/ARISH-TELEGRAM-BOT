 const axios = require('axios');

module.exports = {
  config: {
    name: "bot",
    credits: "Nayan",
    prefix: "auto",
    permission: 0,
    aliases: ["bot"],
    description: " Chat With bot",
    tags: ["General"],
  },
  start: async ({ event, api, botInfo }) => {
    const lastReplies = {};
    
    const botId = botInfo.id;
    let isReplyEnabled = true; 
    const text = event.body;
    const chatId = event.msg.chat.id;

    const greetings = [
      "আহ শুনা আমার তোমার অলিতে গলিতে উম্মাহ😇😘",
      "কি গো সোনা আমাকে ডাকছ কেনো",
      "বার বার আমাকে ডাকস কেন😡",
      "আহ শোনা আমার আমাকে এতো ডাক্তাছো কেনো আসো বুকে আশো🥱",
      "হুম জান তোমার অইখানে উম্মমাহ😷😘",
      "আসসালামু আলাইকুম বলেন আপনার জন্য কি করতে পারি",
      "আমাকে এতো না ডেকে বস তুষারকে একটা গফ দে 🙄",
      "jang hanga korba",
      "jang bal falaba🙂"
    ];

    const fetchApiResponse = async (text) => {
      try {
        const kl = await axios.get('https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json');
        const apiUrl = kl.data.api2;
        const response = await axios.get(`${apiUrl}/sim?type=ask&ask=${encodeURIComponent(text)}`);
        if (response.data.status === "200") {
          return response.data.data.msg;
        }
        return "⚠️ Unexpected response from the API.";
      } catch (error) {
        console.error("Error fetching data from API:", error);
        return "⚠️ Unable to fetch data from the API.";
      }
    };

    if (text.toLowerCase() === "off") {
      isReplyEnabled = false;
      await api.sendMessage(chatId, "✅ Reply functionality is now turned off.");
      return;
    }

    if (text.toLowerCase() === "on") {
      isReplyEnabled = true;
      await api.sendMessage(chatId, "✅ Reply functionality is now turned on.");
      return;
    }

    
    if (text) {
      const apiResponse = await fetchApiResponse(text);
      lastReplies[chatId] = apiResponse;
      await api.sendMessage(chatId, apiResponse, {reply_to_message_id: event.msg.message_id});
    } else {
      
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      const firstName = event.message.from?.first_name || "Undefined";
      const lastName = event.message.from?.last_name || "Undefined";
      await api.sendMessage(chatId, `${firstName} ${lastName}, ${randomGreeting}`, {reply_to_message_id: event.msg.message_id});
    }


    api.on("message", async (msg) => {
      if (msg.reply_to_message && msg.reply_to_message.from.id === botId) {
        const chatId = msg.chat.id;
        const userReply = msg.text;

        if (isReplyEnabled && lastReplies[chatId]) {
          const apiResponse = await fetchApiResponse(userReply);
          await api.sendMessage(chatId, apiResponse);
        }
      }
    });
  },
};
