# Alerta Telegram Qvapay

## Descripción

Alerta Telegram Qvapay es un bot de Telegram diseñado para notificar a los usuarios sobre ofertas de compra y venta de criptomonedas en la plataforma Qvapay. El bot permite a los usuarios autenticarse, definir parámetros para las consultas de ofertas y recibir notificaciones en tiempo real sobre las ofertas que cumplen con sus criterios.

## Características

- Autenticación de usuarios en la plataforma Qvapay.
- Definición de parámetros para consultas de ofertas.
- Notificaciones en tiempo real sobre ofertas que cumplen con los criterios definidos.
- Filtrado y ordenamiento de ofertas por fecha y ratio.
- **Modo Automático**: Permite a los usuarios configurar el bot para que realice consultas automáticamente en intervalos definidos.

## Requisitos

- Node.js v14 o superior.
- Cuenta de Telegram y acceso al BotFather para crear un nuevo bot.
- Acceso a la API de Qvapay para obtener ofertas.

## Instalación

1. Clona el repositorio:

   ```
   git clone https://github.com/tu-usuario/alerta-telegram-qvapay.git
   ```

2. Navega al directorio del proyecto:

   ```
   cd alerta-telegram-qvapay
   ```

3. Instala las dependencias:

   ```
   npm install
   ```

4. Crea un archivo `.env` en la raíz del proyecto y define las siguientes variables de entorno:

   ```
   TELEGRAM_BOT_TOKEN=tu_token_de_bot
   TELEGRAM_CHANNEL_ID=tu_id_de_canal
   ```

5. Ejecuta el bot:

   ```
   node bot.js
   ```

## Uso

1. Inicia el bot y sigue las instrucciones para autenticarte en la plataforma Qvapay.
2. Define los parámetros para las consultas de ofertas utilizando los comandos proporcionados por el bot.
3. Recibe notificaciones en tiempo real sobre las ofertas que cumplen con tus criterios.
4. **Modo Automático**: Utiliza los comandos `/Modo Automático ON` y `/Modo Automático OFF` para activar o desactivar el modo automático.

## Comandos

- `/start`: Inicia el bot y muestra el mensaje de bienvenida.
- `/login tu_Usuario tu_Contraseña`: Autentica al usuario en la plataforma Qvapay.
- `/Ofertas_sell_CUP min max ratio orden`: Consulta ofertas de venta de CUP.
- `/Ofertas_buy_CUP min max ratio orden`: Consulta ofertas de compra de CUP.
- `/Ofertas_sell_MLC min max ratio orden`: Consulta ofertas de venta de MLC.
- `/Ofertas_buy_MLC min max ratio orden`: Consulta ofertas de compra de MLC.
- `/Modo Automático ON`: Activa el modo automático para realizar consultas automáticamente.
- `/Modo Automático OFF`: Desactiva el modo automático.

## Despliegue en Render

Para desplegar este proyecto en Render, sigue los pasos detallados en la sección de [Despliegue](#despliegue).

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para discutir cambios o mejoras.

## Licencia

Este proyecto está licenciado bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.

```

Este es solo un ejemplo. Asegúrate de ajustar el contenido para que refleje con precisión los cambios y características específicas de tu proyecto.
```
