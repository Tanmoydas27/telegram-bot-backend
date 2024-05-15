const app = require('express')();
require('dotenv').config();

const telegrambot = require('node-telegram-bot-api');
const translator = require('translate-google');

const bot = new telegrambot(process.env.BOT_TOKEN, { polling: true });

const selectedLanguages = {};

function sendLanguageSelection(chatId, message, languages) {
    bot.sendMessage(chatId, message, {
        reply_markup: {
            inline_keyboard: languages.map(language => [{ text: language.name, callback_data: language.code }])
        }
    });
}


const AvaliableLanguages =
[
    { name: 'English', code: 'en' },
    { name: 'Bengali', code: 'bn' },
    { name: 'Hindi', code: 'hi' }
];


bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Wellcome to The Line Transalation Bot ! 😊");
    bot.sendMessage(chatId, "Choose Your Prefered Languages for translation... !✒️");
    sendLanguageSelection(chatId, 'Choose the Source language:', AvaliableLanguages);
});


bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (!selectedLanguages[chatId]) {

        selectedLanguages[chatId] = {source: data};
        bot.sendMessage(chatId, `You selected source language: ${data}`);
        sendLanguageSelection(chatId, 'Choose the target language:', AvaliableLanguages);
    } else {
 
        selectedLanguages[chatId].target = data;
        bot.sendMessage(chatId, `You selected target language: ${data}`);
        bot.sendMessage(chatId, 'Enter the text for translation:');
    }
});


bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (selectedLanguages[chatId] && selectedLanguages[chatId].source && selectedLanguages[chatId].target) {

        try {
            const translation = await translator(text, { from: selectedLanguages[chatId].source,  to: selectedLanguages[chatId].target});
            bot.sendMessage(chatId, `${translation}`);
        } catch (error) {
            console.error('Translation error:', error);
            bot.sendMessage(chatId, 'An error occurred while translating the text. Please try again.');
        }
        // delete selectedLanguages[chatId];
    }
});

app.get('/', (req,res)=>{
    res.send({success: true, message:"Fetch Successfull in Root"})
})

app.listen(3000, ()=>{
    console.log("Running in port 3000")
})
