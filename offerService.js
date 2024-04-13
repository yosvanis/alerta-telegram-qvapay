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



module.exports = {
 getOffers,
};