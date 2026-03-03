require("dotenv").config();
const { 
  Client, 
  GatewayIntentBits, 
  SlashCommandBuilder, 
  REST, 
  Routes, 
  PermissionsBitField 
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

// MAP PARA SALDO
const moedas = new Map();

// ===================
// COMANDOS SLASH
// ===================
const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Ver latência do bot"),
  new SlashCommandBuilder().setName("saldo").setDescription("Ver seu saldo"),
  new SlashCommandBuilder().setName("daily").setDescription("Resgatar recompensa diária"),
  new SlashCommandBuilder().setName("trabalhar").setDescription("Trabalhar e ganhar moedas"),
  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banir um usuário")
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("Usuário para banir")
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName("enviar")
    .setDescription("O bot envia a mensagem que você digitar")
    .addStringOption(option =>
      option.setName("mensagem")
            .setDescription("A mensagem que o bot vai enviar")
            .setRequired(true)),
  new SlashCommandBuilder()
    .setName("limpar")
    .setDescription("Apaga uma quantidade de mensagens")
    .addIntegerOption(option =>
      option.setName("quantidade")
            .setDescription("Quantidade de mensagens a apagar")
            .setRequired(true))
];

// ===================
// LIMPAR COMANDOS ANTIGOS E REGISTRAR NOVOS
// ===================
const rest = new REST({ version: "10" }).setToken(TOKEN);

async function registrarComandos() {
  try {
    console.log("🗑 Limpando comandos antigos...");
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] });

    console.log("🔄 Registrando comandos novos...");
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log("✅ Comandos registrados com sucesso!");
  } catch (error) {
    console.error(error);
  }
}

// chama a função no inicio
registrarComandos();

// ===================
// EVENTOS
// ===================
client.once("ready", () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // PING
  if (interaction.commandName === "ping") {
    await interaction.reply("🏓 Pong!");
  }

  // SALDO
  if (interaction.commandName === "saldo") {
    const saldo = moedas.get(interaction.user.id) || 0;
    await interaction.reply(`💰 Você tem ${saldo} moedas.`);
  }

  // DAILY
  if (interaction.commandName === "daily") {
    const saldo = moedas.get(interaction.user.id) || 0;
    moedas.set(interaction.user.id, saldo + 500);
    await interaction.reply("🎁 Você ganhou 500 moedas!");
  }

  // TRABALHAR
  if (interaction.commandName === "trabalhar") {
    const valor = Math.floor(Math.random() * 300) + 100;
    const saldo = moedas.get(interaction.user.id) || 0;
    moedas.set(interaction.user.id, saldo + valor);
    await interaction.reply(`💼 Você trabalhou e ganhou ${valor} moedas!`);
  }

  // BAN
  if (interaction.commandName === "ban") {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return interaction.reply({ content: "❌ Você não tem permissão.", ephemeral: true });

    const user = interaction.options.getUser("usuario");
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.reply("Usuário não encontrado.");

    await member.ban();
    await interaction.reply("🔨 Usuário banido.");
  }

  // ENVIAR
  if (interaction.commandName === "enviar") {
    const texto = interaction.options.getString("mensagem");
    await interaction.channel.send(texto);
    await interaction.reply({ content: "✅ Mensagem enviada!", ephemeral: true });
  }

  // LIMPAR
  if (interaction.commandName === "limpar") {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return interaction.reply({ content: "❌ Você não tem permissão para apagar mensagens.", ephemeral: true });

    const quantidade = interaction.options.getInteger("quantidade");
    await interaction.channel.bulkDelete(quantidade, true);
    await interaction.reply({ content: `🧹 Apaguei ${quantidade} mensagens!`, ephemeral: true });
  }
});

// LOGIN DO BOT
client.login(TOKEN);
