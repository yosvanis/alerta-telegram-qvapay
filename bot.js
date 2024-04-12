//Módulo que maneja la lógica del bot, incluyendo el inicio del bot y el manejo de comandos.

const TelegramBot = require("node-telegram-bot-api");
const authService = require("./authService");
const telegramService = require("./telegramService");
const offerService = require("./offerService");
require("dotenv").config();

// Variables de entorno
const tokenBot = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.TELEGRAM_CHANNEL_ID;
const username = process.env.TELEGRAM_USUARIO;
const password = process.env.TELEGRAM_PASSWORD;
const sessionData = new Map();

const token = `${tokenBot}`;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const opts = {
    reply_markup: {
      keyboard: [
        [{ text: "Modo Automático ON" }, { text: "Modo Automático OFF" }],
        [{ text: "Enviar Manualmente parámetros" }],
        [{ text: "Reset parámetros" }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
  bot.sendMessage(
    chatId,
    "¡Hola! Soy el bot de Telegram <<< Alerta Precio Qvapay >>>.\nPara autenticarte en la plataforma Qvapay, ejecutar el siguiente comando:\n /login\n\n\n Comandos para ver Ofertas:\n /Ofertas_sell_CUP min max ratio orden\n /Ofertas_buy_CUP min max ratio orden\n /Ofertas_sell_MLC min max ratio orden\n /Ofertas_buy_MLC min max ratio orden\n\nEjemplos:\n /Ofertas_sell_CUP 1 100 360 ratio\n/Ofertas_buy_MLC 1 100 1.24 fecha",
    opts
  );
});

bot.onText(/\/login/, async (msg) => {
  const chatId = msg.chat.id;
 // const args = match[1].split(" ");
  //const [username, password] = args;

  try {
    const data = await authService.login(username, password);
    console.log("Login exitoso:", data);
    // Almacenar los datos de la sesión
    sessionData.set(chatId, data);
    // Mostrar el mensaje después del inicio de sesión exitoso
    telegramService.sendMessage(
      chatId,
      "Definir los parámetros iniciales para las consultas, Comandos:\n /Ofertas_sell_CUP min max ratio orden\n /Ofertas_buy_CUP min max ratio orden\n /Ofertas_sell_MLC min max ratio orden\n /Ofertas_buy_MLC min max ratio orden\n"
    );
  } catch (error) {
    console.error(error);
    telegramService.sendMessage(
      chatId,
      "Hubo un error al establecer usuario y contraseña."
    );
  }
});

/* bot.onText(/\/Ofertas_sell_CUP (.+)/, async (msg, match) => {
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
}); */

let automaticMode = false;
let automaticModeParams = {};

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Manejar la acción del botón "Reset parámetros"
 if (text === "Reset parámetros") {
    // Limpiar los parámetros automáticos para el chatId del usuario
    automaticModeParams[chatId] = {};
    telegramService.sendMessage(chatId, "Parámetros reseteados. Ahora puedes introducirlos nuevamente.");
    return; // Salir de la función para evitar procesar el mensaje como un comando
 }

  if (text.startsWith("/Ofertas_")) {
    // Procesar los parámetros enviados por el usuario

    const params = text.split(" ");
    const command = params[0];
    const min = parseFloat(params[1]);
    const max = parseFloat(params[2]);
    const ratio = parseFloat(params[3]);
    const orden = params[4];
    // Almacenar los parámetros en automaticModeParams
    if (!automaticModeParams[chatId]) {
      automaticModeParams[chatId] = {};
    }
    automaticModeParams[chatId][command] = { min, max, ratio, orden };

    // Verificar si todos los comandos han sido enviados
    if (Object.keys(automaticModeParams[chatId]).length === 4) {
      telegramService.sendMessage(
        chatId,
        "Todos los parámetros han sido enviados. Modo Automático está listo para activarse."
      );
    }
  }

  if (text === "Modo Automático ON" && automaticModeParams[chatId]) {
    automaticMode = true;
    telegramService.sendMessage(
      chatId,
      "Modo Automático está activo. Comenzando a hacer peticiones automáticas cada minuto."
    );

    // Iniciar el intervalo para hacer peticiones automáticas
    setInterval(async () => {
      const data = sessionData.get(chatId);
      if (automaticMode && automaticModeParams[chatId]) {
        for (const command in automaticModeParams[chatId]) {
          const params = automaticModeParams[chatId][command];
          const commands = {
            [command]: params,
          };
          console.log(commands);

          offerService.getAndProcessOffersAutomatic(
            data,
            commands,
            chatId,
            channelId
          );
        }
      }
    }, 1 * 60 * 1000); // 1 minuto en milisegundos
  } else if (text === "Modo Automático OFF") {
    automaticMode = false;
    telegramService.sendMessage(
      chatId,
      "Modo Automático OFF. Las peticiones automáticas han sido detenidas."
    );
  } else if (text === "Enviar Manualmente parámetros") {
    const data = sessionData.get(chatId);
    
    if (!automaticMode && automaticModeParams[chatId]) {
      for (const command in automaticModeParams[chatId]) {
        const params = automaticModeParams[chatId][command];
        const commands = {
          [command]: params,
        };
        offerService.getAndProcessOffersAutomatic(
          data,
          commands,
          chatId,
          channelId
        );
      }
      telegramService.sendMessage(chatId, "Parámetros enviados manualmente.");
    } else {
      telegramService.sendMessage(
        chatId,
        "Modo Automático está activo, no puede realizar peticiones manuales."
      );
    }
  }

  
});

module.exports = bot;
