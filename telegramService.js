//Módulo que maneja la interacción con Telegram, como enviar mensajes.

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
    await bot.sendMessage(chatId, message);
    console.log("Mensaje enviado exitosamente.");
  } catch (error) {
    console.error("Error al enviar el mensaje:", error);
  }
}

module.exports = { sendMessage, sendArrayToTelegram };
