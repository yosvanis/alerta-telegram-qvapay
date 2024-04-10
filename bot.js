//Módulo que maneja la lógica del bot, incluyendo el inicio del bot y el manejo de comandos.

const TelegramBot = require("node-telegram-bot-api");
const authService = require("./authService");
const telegramService = require("./telegramService");
const offerService = require("./offerService");
require("dotenv").config();

// Variables de entorno
const tokenBot = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.TELEGRAM_CHANNEL_ID;
const sessionData = new Map();

const token = `${tokenBot}`;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  telegramService.sendMessage(
    chatId,
    "¡Hola! Soy el bot de Telegram <<< Alerta Precio Qvapay >>>.\nPara autenticarte en la plataforma Qvapay, ejecutar el siguiente comando:\n /login tu_usuario tu_contraseña\n\n\n Comandos para ver Ofertas:\n /Ofertas_sell_CUP min max ratio orden\n /Ofertas_buy_CUP min max ratio orden\n /Ofertas_sell_MLC min max ratio orden\n /Ofertas_buy_MLC min max ratio orden\n\nEjemplos:\n /Ofertas_sell_CUP 1 100 360 ratio\n/Ofertas_buy_MLC 1 100 1.24 fecha"
  );
});

bot.onText(/\/login (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const args = match[1].split(" ");
  const [username, password] = args;

  try {
    const data = await authService.login(username, password);
    console.log("Login exitoso:", data);
    // Almacenar los datos de la sesión
    sessionData.set(chatId, data);
    // Mostrar el mensaje después del inicio de sesión exitoso
    telegramService.sendMessage(
      chatId,
      "Definir los parámetros iniciales para las consultas¡, Comandos:\n /Ofertas_sell_CUP min max ratio orden\n /Ofertas_buy_CUP min max ratio orden\n /Ofertas_sell_MLC min max ratio orden\n /Ofertas_buy_MLC min max ratio orden\n"
    );
  } catch (error) {
    console.error(error);
    telegramService.sendMessage(
      chatId,
      "Hubo un error al establecer usuario y contraseña."
    );
  }
});

bot.onText(/\/Ofertas_sell_CUP (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const argsOf = match[1].split(" ");
  const [min_sell_CUP, max_sell_CUP, ratio_sell_CUP, orden_sell_CUP] = argsOf;
  const type_sell_CUP = "sell";
  const coin_sell_CUP = "BANK_CUP";

  // Obtener los datos de la sesión
  const data = sessionData.get(chatId);
  if (!data) {
    telegramService.sendMessage(chatId, "Primero debes iniciar sesión.");
    return;
  }

  offerService.getAndProcessOffers(
    data,
    type_sell_CUP,
    coin_sell_CUP,
    min_sell_CUP,
    max_sell_CUP,
    ratio_sell_CUP,
    orden_sell_CUP,
    chatId,
    channelId
  );
});

bot.onText(/\/Ofertas_sell_MLC (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const argsOf = match[1].split(" ");
  const [min_sell_MLC, max_sell_MLC, ratio_sell_MLC, orden_sell_MLC] = argsOf;
  const type_sell_MLC = "sell";
  const coin_sell_MLC = "BANK_MLC";

  // Obtener los datos de la sesión
  const data = sessionData.get(chatId);
  if (!data) {
    telegramService.sendMessage(chatId, "Primero debes iniciar sesión.");
    return;
  }

  offerService.getAndProcessOffers(
    data,
    type_sell_MLC,
    coin_sell_MLC,
    min_sell_MLC,
    max_sell_MLC,
    ratio_sell_MLC,
    orden_sell_MLC,
    chatId,
    channelId
  );
});

bot.onText(/\/Ofertas_buy_CUP (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const argsOf = match[1].split(" ");
  const [min_buy_CUP, max_buy_CUP, ratio_buy_CUP, orden_buy_CUP] = argsOf;
  const type_buy_CUP = "buy";
  const coin_buy_CUP = "BANK_CUP";

  // Obtener los datos de la sesión
  const data = sessionData.get(chatId);
  if (!data) {
    telegramService.sendMessage(chatId, "Primero debes iniciar sesión.");
    return;
  }
  offerService.getAndProcessOffers(
    data,
    type_buy_CUP,
    coin_buy_CUP,
    min_buy_CUP,
    max_buy_CUP,
    ratio_buy_CUP,
    orden_buy_CUP,
    chatId,
    channelId
  );
});

bot.onText(/\/Ofertas_buy_MLC (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const argsOf = match[1].split(" ");
  const [min_buy_MLC, max_buy_MLC, ratio_buy_MLC, orden_buy_MLC] = argsOf;
  const type_buy_MLC = "buy";
  const coin_buy_MLC = "BANK_MLC";

  // Obtener los datos de la sesión
  const data = sessionData.get(chatId);
  if (!data) {
    telegramService.sendMessage(chatId, "Primero debes iniciar sesión.");
    return;
  }
  offerService.getAndProcessOffers(
    data,
    type_buy_MLC,
    coin_buy_MLC,
    min_buy_MLC,
    max_buy_MLC,
    ratio_buy_MLC,
    orden_buy_MLC,
    chatId,
    channelId
  );
});

module.exports = bot;
