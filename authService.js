//Módulo que maneja la autenticación y la obtención de ofertas

const axios = require("axios");

async function login(email, password) {
 const url = "https://qvapay.com/api/auth/login";
 const headers = { Accept: "application/json" };
 const body = { email, password };

 try {
    const response = await axios.post(url, body, { headers });
    return response.data;
 } catch (error) {
    console.error("Error al realizar el login:", error);
    throw error;
 }
}

async function logout(accessToken) {
 const url = "https://qvapay.com/api/auth/logout";
 const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
 };

 try {
    const response = await axios.get(url, { headers });
    console.log(JSON.stringify(response.data));
    return response.data;
 } catch (error) {
    console.error("Error al realizar el logout:", error);
    throw error;
 }
}

module.exports = { login, logout };
