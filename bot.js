const TelegramBot = require("node-telegram-bot-api");
const authService = require("./authService");
const offerService = require("./offerService");
require("dotenv").config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.TELEGRAM_CHANNEL_ID;
const username = process.env.TELEGRAM_USUARIO;
const password = process.env.TELEGRAM_PASSWORD;
const intervalo = process.env.TELEGRAM_INTERVALO;
const sessionData = new Map();
const bot = new TelegramBot(token, { polling: true });

const express = require("express");
const app = express();

// This line is important to ensure your app listens to the PORT env var
const port = process.env.PORT ?? 8080;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

let automaticMode = false;
let automaticModeParams = {};

function sendMessage(chatId, text) {
  bot.sendMessage(chatId, text);
}
async function sendArrayToTelegram(chatId, array, ordenadoPor) {
  let message = "";
  array.forEach((offer, index) => {
    let tipo = offer.type === "buy" ? " de compra " : " de venta ";

    if (index == 0) {
      message +=
        offer.type === "buy"
          ? `En estas ofertas Recibes  ${offer.coin} y Pagas USD,`
          : `En estas ofertas Recibes USD y Pagas ${offer.coin}\n\n`;
      message += `\n>>> ${ordenadoPor} <<<\n`;
    }

    message += `\n--- Oferta ${tipo} # ${index + 1} ---\n`;
    message += `Fecha: ${new Date(offer.ultimaFecha).toLocaleDateString(
      "es-ES",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    )}, `;
    message +=
      offer.type === "buy"
        ? `Recibes: ${parseFloat(offer.receive).toFixed(2)} ${
            offer.coin
          }, Pagas: ${offer.amount} USD,`
        : `Recibes: ${offer.amount} USD , Pagas: ${parseFloat(
            offer.receive
          ).toFixed(2)} ${offer.coin} ,`;
    message += ` Ratio: ${offer.Ratio}\n`;
  });

  try {
    sendMessage(chatId, message);
    console.log("Mensaje enviado exitosamente.");
  } catch (error) {
    console.error("Error al enviar el mensaje:", error);
  }
}

let previousOffers = {};

async function getAndProcessOffersAutomatic(data, commands, chatId, channelId) {
  try {
    for (const command in commands) {
      const { min, max, ratio, orden } = commands[command];
      const type = command.includes("buy") ? "buy" : "sell";
      const coin = command.split("_")[2];

      const datos = await offerService.getOffers(
        data,
        type,
        "BANK_" + coin,
        min,
        max
      );

      let filteredOffers = datos.data
        .filter(
          (offer) =>
            offer.status === "open" &&
            (type === "buy"
              ? +offer.receive / +offer.amount >= ratio
              : +offer.receive / +offer.amount <= ratio)
        )
        .map((offer) => ({
          Ratio: offer.receive / offer.amount,
          name: offer.owner.name + ": " + offer.owner.average_rating,
          type: offer.type,
          coin: offer.coin,
          amount: offer.amount,
          receive: offer.receive,
          status: offer.status,
          message: offer.message,
          ultimaFecha: offer.updated_at,
        }));

      let mensaje;
      if (orden === "fecha") {
        filteredOffers = filteredOffers.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        mensaje = "Ofertas ordenadas por fechas (más reciente primero)";
      } else {
        filteredOffers = filteredOffers.sort((a, b) => b.Ratio - a.Ratio);
        mensaje = "Ofertas ordenadas por mejor oferta";
      }

      if (filteredOffers.length != 0) {
        const previousOffersString = JSON.stringify(previousOffers[command]);
        const currentOffersString = JSON.stringify(filteredOffers);

        if (previousOffersString !== currentOffersString) {
          previousOffers[command] = filteredOffers;

          await sendArrayToTelegram(`${channelId}`, filteredOffers, mensaje);
        }
      }
    }
  } catch (error) {
    console.error("Error al obtener las ofertas:", error);
    botFunciones.sendMessage(chatId, "Hubo un error al obtener las ofertas.");
  }
}

function handleStartCommand(msg) {
  const chatId = msg.chat.id;
  const opts = {
    reply_markup: {
      keyboard: [
        [{ text: "Modo Automático ON" }, { text: "Modo Automático OFF" }],
        [{ text: "Enviar Manualmente parámetros" }, { text: "Reset parámetros" }],
       
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
  sendMessage(
    chatId,
    "¡Hola! Soy el bot de Telegram <<< Alerta Precio Qvapay >>>.\nPara autenticarte en la plataforma Qvapay, ejecutar el siguiente comando:\n /login\nPara cerrar sesión:\n /logout\n\n Comandos para ver Ofertas:\n /Ofertas_sell_CUP min max ratio orden\n /Ofertas_buy_CUP min max ratio orden\n /Ofertas_sell_MLC min max ratio orden\n /Ofertas_buy_MLC min max ratio orden\n\nEjemplos:\n /Ofertas_sell_CUP 1 100 360 ratio\n/Ofertas_buy_MLC 1 100 1.24 fecha",
    opts
  );
}
function handleAliveCommand(msg) {
  const chatId = msg.chat.id;
 
  sendMessage(
    chatId,
    "El servidor is Alive!!!"
  );
}

async function handleLoginCommand(msg) {
  const chatId = msg.chat.id;
  try {
    const data = await authService.login(username, password);
    console.log("Login exitoso:", data);
    sessionData.set(chatId, data);
    sendMessage(
      chatId,
      `Login exitoso.\nSaldo en QvaPay: ${data.me.balance}\n\n Definir los parámetros iniciales para las 4 consultas, Comandos:\n /Ofertas_sell_CUP min max ratio orden\n /Ofertas_buy_CUP min max ratio orden\n /Ofertas_sell_MLC min max ratio orden\n /Ofertas_buy_MLC min max ratio orden\n`
    );
  } catch (error) {
    console.error(error);
    sendMessage(chatId, "Hubo un error al establecer usuario y contraseña.");
  }
}

async function handleLogoutCommand(msg) {
  const chatId = msg.chat.id;
  const datosUsuario = sessionData.get(chatId);
  try {
    const data = await authService.logout(datosUsuario.accessToken);
    console.log("Sesión cerrada exitosamente", data);
    //sessionData.set(chatId, data);
    sendMessage(
      chatId,
      "Sesión cerrada exitosamente"
    );
  } catch (error) {
    console.error(error);
    sendMessage(chatId, "Hubo un error al cerrar sesión");
  }
}

function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "Reset parámetros" || text === "/reset_params") {
    automaticModeParams[chatId] = {};
    automaticMode = false;
    sendMessage(
      chatId,
      "Parámetros reseteados. Ahora puedes introducirlos nuevamente."
    );
    return;
  }

  const allowedCommands = [
    "/Ofertas_sell_CUP",
    "/Ofertas_buy_CUP",
    "/Ofertas_sell_MLC",
    "/Ofertas_buy_MLC",
  ];

  if (text.startsWith("/Ofertas_")) {
    const params = text.split(" ");
    const command = params[0];
    const min = parseFloat(params[1]);
    const max = parseFloat(params[2]);
    const ratio = parseFloat(params[3]);
    const orden = params[4];

    if (!automaticModeParams[chatId]) {
      automaticModeParams[chatId] = {};
    }

    // Verificar si el comando es uno de los permitidos
    if (allowedCommands.includes(command)) {
      // Actualizar o sobrescribir los parámetros para el comando
      automaticModeParams[chatId][command] = { min, max, ratio, orden };

      // Verificar cuántos comandos permitidos han sido introducidos
      const introducedCommands = Object.keys(
        automaticModeParams[chatId]
      ).filter((cmd) => allowedCommands.includes(cmd));

      if (introducedCommands.length === allowedCommands.length) {
        // Todos los comandos han sido introducidos
        sendMessage(
          chatId,
          "Todos los parámetros han sido enviados. Modo Automático está listo para activarse."
        );
      } else {
        // Calcular qué comandos faltan
        const missingCommands = allowedCommands.filter(
          (cmd) => !introducedCommands.includes(cmd)
        );
        const missingCommandsText = missingCommands.join(", ");
        sendMessage(
          chatId,
          `Faltan los siguientes comandos: ${missingCommandsText}`
        );
      }
    } else {
      // El comando no es uno de los permitidos
      sendMessage(
        chatId,
        "Comando no permitido. Por favor, introduce uno de los comandos permitidos."
      );
    }
  }

  if (text === "Modo Automático ON" || text === "/automatic") {
    if (automaticModeParams[chatId] && !automaticMode) {
      automaticMode = true;
      sendMessage(
        chatId,
        `Modo Automático está activo. Comenzando a hacer peticiones automáticas cada ${intervalo} minuto.`
      );
      setInterval(async () => {
        const data = sessionData.get(chatId);
        if (automaticMode) {
          for (const command in automaticModeParams[chatId]) {
            const params = automaticModeParams[chatId][command];
            const commands = { [command]: params };
            console.log(commands);
            getAndProcessOffersAutomatic(data, commands, chatId, channelId);
          }
        }
      }, intervalo * 60 * 1000);
    } else {
      sendMessage(
        chatId,
        "No se pudo establecer el Modo Automático. Resetee las opciones y establezcalas nuevamente"
      );
    }
  }

  if (text === "Modo Automático OFF" || text === "/automatic_off") {
    automaticMode = false;
    sendMessage(
      chatId,
      "Modo Automático OFF. Las peticiones automáticas han sido detenidas."
    );
  }
  if (text === "Enviar Manualmente parámetros" || text === "/send_params") {
    const data = sessionData.get(chatId);
    if (!automaticMode && automaticModeParams[chatId]) {
      for (const command in automaticModeParams[chatId]) {
        const params = automaticModeParams[chatId][command];
        const commands = { [command]: params };
        getAndProcessOffersAutomatic(data, commands, chatId, channelId);
      }
      sendMessage(chatId, "Parámetros enviados manualmente.");
    } else {
      sendMessage(
        chatId,
        "Modo Automático está activo, no puede realizar peticiones manuales."
      );
    }
  }
}

bot.onText(/\/start/, handleStartCommand);
bot.onText(/\/alive/, handleAliveCommand);
bot.onText(/\/login/, handleLoginCommand);
bot.onText(/\/logout/, handleLogoutCommand);
bot.on("message", handleMessage);

module.exports = { bot };
