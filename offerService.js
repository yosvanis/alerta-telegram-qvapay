//  Lógica para obtener y procesar las ofertas.

const telegramService = require("./telegramService"); // Asegúrate de que telegramService esté disponible
const axios = require("axios");
async function getOffers(response, type, coin, min, max) {
  const url = `https://qvapay.com/api/p2p/index?type=${type}&coin=${coin}&min=${min}&max=${max}`;
  const accessToken = response.accessToken;
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error("Error al obtener las ofertas:", error);
    throw error;
  }
}

async function getAndProcessOffers(
  data,
  type,
  coin,
  min,
  max,
  ratio,
  orden,
  chatId,
  channelId
) {
  try {
    const datos = await getOffers(data, type, coin, min, max);
    
    let filteredOffers = datos.data
      .filter(
        (offer) =>
          offer.status === "open" && offer.receive / offer.amount >= ratio
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

    console.log(mensaje, filteredOffers);
    telegramService.sendArrayToTelegram(
      `${channelId}`,
      filteredOffers,
      mensaje
    );
  } catch (error) {
    console.error("Error al obtener las ofertas:", error);
    telegramService.sendMessage(
      chatId,
      "Hubo un error al obtener las ofertas."
    );
  }
}

module.exports = {
  getAndProcessOffers,
};
