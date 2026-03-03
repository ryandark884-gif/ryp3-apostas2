require("dotenv").config();
const { 
  Client, 
  GatewayIntentBits, 
  SlashCommandBuilder, 
  REST, 
  Routes, 
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ChannelType,
  EmbedBuilder
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences
  ]
});

// MAP PARA SALDO
const moedas = new Map();

// VARIÁVEL PARA CANAL DE BOAS VINDAS
let canalBoasVindas;

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
            .setRequired(true)),
  new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Cria o painel de tickets"),
  new SlashCommandBuilder()
    .setName("boasvindas")
    .setDescription("Configura o canal de boas-vindas")
    .addChannelOption(option =>
      option.setName("canal")
            .setDescription("Canal onde a mensagem de boas-vindas será enviada")
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

registrarComandos();

// ===================
// EVENTOS
// ===================
client.once("ready", () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

// ------------------
// INTERAÇÕES DE COMANDOS
// ------------------
client.on("interactionCreate", async interaction => {
  if (interaction.isChatInputCommand()) {

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

    // TICKET (Painel com menu suspenso)
    if (interaction.commandName === "ticket") {
      const row = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("tipo_ticket")
            .setPlaceholder("Selecione o tipo de suporte")
            .addOptions([
              { label: "⚒️・suporte", value: "suporte", description: "Suporte geral" },
              { label: "💰・receber premiações", value: "premiacao", description: "Receber premiações" },
              { label: "💸・reembolso", value: "reembolso", description: "Problemas com pagamento" },
              { label: "🔰・vagas staff", value: "vagas", description: "Suporte para vagas staff" }
            ])
        );

      await interaction.reply({
        content: "📌 Para obter Atendimento abra um ticket selecionando uma opção no menu abaixo. Fique à vontade para escolher uma opção de acordo com a necessidade.",
        components: [row]
      });
    }

    // BOAS VINDAS
    if (interaction.commandName === "boasvindas") {
      canalBoasVindas = interaction.options.getChannel("canal");
      await interaction.reply({ content: `✅ Canal de boas-vindas configurado para ${canalBoasVindas}`, ephemeral: true });
    }
  }

  // ------------------
  // INTERAÇÕES DE MENU E BOTÕES
  // ------------------
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "tipo_ticket") {
      const tipo = interaction.values[0];
      const nomeCanal = `ticket-${interaction.user.username}-${tipo}`;
      const existingChannel = interaction.guild.channels.cache.find(c => c.name === nomeCanal);
      if (existingChannel)
        return interaction.reply({ content: "❌ Você já tem um ticket desse tipo aberto!", ephemeral: true });

      const canal = await interaction.guild.channels.create({
        name: nomeCanal,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: ["ViewChannel"] },
          { id: interaction.user.id, allow: ["ViewChannel", "SendMessages"] }
        ]
      });

      const botoes = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("finalizar_ticket")
            .setLabel("Finalizar Ticket")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("notificar_usuario")
            .setLabel("Notificar Usuário")
            .setStyle(ButtonStyle.Primary)
        );

      await canal.send({
        content: `🎫 ${interaction.user} abriu um ticket de **${tipo}**!`,
        components: [botoes]
      });

      await interaction.reply({ content: `✅ Ticket criado: ${canal}`, ephemeral: true });
    }
  }

  // ------------------
  // BOTÕES DENTRO DO TICKET
  // ------------------
  if (interaction.isButton()) {
    if (interaction.customId === "finalizar_ticket") {
      if (interaction.channel.name.startsWith("ticket-")) {
        await interaction.channel.delete();
      } else {
        await interaction.reply({ content: "❌ Este canal não é um ticket!", ephemeral: true });
      }
    }

    if (interaction.customId === "notificar_usuario") {
      const match = interaction.channel.name.match(/^ticket-(.+)-/);
      if (!match) return interaction.reply({ content: "❌ Não foi possível identificar o usuário!", ephemeral: true });

      const username = match[1];
      const member = interaction.guild.members.cache.find(m => m.user.username === username);
      if (!member) return interaction.reply({ content: "❌ Usuário não encontrado!", ephemeral: true });

      await interaction.channel.send(`${member}`);
      await interaction.reply({ content: "✅ Usuário notificado!", ephemeral: true });
    }
  }
});

// ------------------
// EVENTO DE BOAS VINDAS AO ENTRAR
// ------------------
client.on("guildMemberAdd", async member => {
  if (!canalBoasVindas) return;
  canalBoasVindas.send(`👋 BEM VINDO MEU NOBRE TUDO BOM? SEJA BEM VINDO A ORG RYP3 APOSTAS, ${member}`);
});

// LOGIN DO BOT
client.login(TOKEN);
