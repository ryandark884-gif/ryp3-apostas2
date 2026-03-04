// ===============================
// 🔥 ORG RYP3 SISTEMA PROFISSIONAL COMPLETO
// ===============================

require("dotenv").config();
const fs = require("fs");
const path = require("path");

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

// ===============================
// 📂 BANCO PERSISTENTE
// ===============================

const dbPath = path.join(__dirname, "database.json");

function loadDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({
      users: {},
      config: {
        taxa: 0.05,
        valorMinimo: 1,
        caixaOrg: 0
      }
    }, null, 2));
  }
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

let db = loadDB();

// ===============================
// 👑 CARGOS
// ===============================

const CARGO_DONO = "00 | RYANTX7";
const CARGO_MEDIADOR = "・ADM DA RYPƐ RSZ";

function isDono(member) {
  return member.roles.cache.some(r => r.name === CARGO_DONO);
}

function isMediador(member) {
  return member.roles.cache.some(r => r.name === CARGO_MEDIADOR);
}

// ===============================
// 💰 FUNÇÕES DE USUÁRIO
// ===============================

function getUser(id) {
  if (!db.users[id]) {
    db.users[id] = {
      saldo: 0,
      pix: null,
      vitorias: 0
    };
    saveDB(db);
  }
  return db.users[id];
}

function addSaldo(id, valor) {
  const user = getUser(id);
  user.saldo += valor;
  saveDB(db);
}

function removeSaldo(id, valor) {
  const user = getUser(id);
  user.saldo -= valor;
  if (user.saldo < 0) user.saldo = 0;
  saveDB(db);
}

function addCaixa(valor) {
  db.config.caixaOrg += valor;
  saveDB(db);
}

function getTaxa() {
  return db.config.taxa;
}

function setTaxa(valor) {
  db.config.taxa = valor;
  saveDB(db);
}

function getCaixa() {
  return db.config.caixaOrg;
}

// ===============================
// 🎮 FILA GLOBAL
// ===============================

let filaAtiva = null;

// ===============================
// 🤖 CLIENT
// ===============================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===============================
// 📜 COMANDOS SLASH
// ===============================

const commands = [

  new SlashCommandBuilder().setName("saldo").setDescription("Ver seu saldo"),

  new SlashCommandBuilder()
    .setName("addsaldo")
    .setDescription("Adicionar saldo (Dono)")
    .addUserOption(o => o.setName("usuario").setDescription("Usuário").setRequired(true))
    .addNumberOption(o => o.setName("valor").setDescription("Valor").setRequired(true)),

  new SlashCommandBuilder()
    .setName("removersaldo")
    .setDescription("Remover saldo (Dono)")
    .addUserOption(o => o.setName("usuario").setDescription("Usuário").setRequired(true))
    .addNumberOption(o => o.setName("valor").setDescription("Valor").setRequired(true)),

  new SlashCommandBuilder().setName("ranking").setDescription("Ranking de vitórias"),

  new SlashCommandBuilder()
    .setName("configtaxa")
    .setDescription("Alterar taxa (Dono)")
    .addNumberOption(o => o.setName("valor").setDescription("Nova taxa").setRequired(true)),

  new SlashCommandBuilder().setName("caixa").setDescription("Ver caixa da org"),

  new SlashCommandBuilder()
    .setName("criarfila")
    .setDescription("Criar fila (Dono)")
    .addStringOption(o =>
      o.setName("modo")
        .setDescription("1x1 / 2x2 / 3x3 / 4x4")
        .setRequired(true))
    .addNumberOption(o =>
      o.setName("valor")
        .setDescription("Valor base")
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName("vencedor")
    .setDescription("Confirmar vencedor (Mediador)")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Vencedor")
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName("pix")
    .setDescription("Configurar seu PIX (Mediador)")
    .addStringOption(o =>
      o.setName("chave")
        .setDescription("Sua chave PIX")
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName("roleta")
    .setDescription("Apostar na roleta")
    .addNumberOption(o =>
      o.setName("valor")
        .setDescription("Valor da aposta")
        .setRequired(true))
];

// ===============================
// 🔄 REGISTRAR COMANDOS
// ===============================

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function registrar() {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
  console.log("✅ Comandos registrados");
}

registrar();
// ===============================
// 🎯 INTERAÇÕES
// ===============================

client.on("interactionCreate", async interaction => {

  if (interaction.isChatInputCommand()) {

    // ================= SALDO =================
    if (interaction.commandName === "saldo") {
      const user = getUser(interaction.user.id);
      return interaction.reply(`💰 Seu saldo: ${user.saldo.toFixed(2)}`);
    }

    // ================= ADDSALDO =================
    if (interaction.commandName === "addsaldo") {
      if (!isDono(interaction.member))
        return interaction.reply({ content: "❌ Apenas dono.", ephemeral: true });

      const usuario = interaction.options.getUser("usuario");
      const valor = interaction.options.getNumber("valor");

      addSaldo(usuario.id, valor);

      return interaction.reply(`✅ ${valor} adicionados a ${usuario.username}`);
    }

    // ================= REMOVERSALDO =================
    if (interaction.commandName === "removersaldo") {
      if (!isDono(interaction.member))
        return interaction.reply({ content: "❌ Apenas dono.", ephemeral: true });

      const usuario = interaction.options.getUser("usuario");
      const valor = interaction.options.getNumber("valor");

      removeSaldo(usuario.id, valor);

      return interaction.reply(`✅ ${valor} removidos de ${usuario.username}`);
    }

    // ================= RANKING =================
    if (interaction.commandName === "ranking") {
      const ranking = Object.entries(db.users)
        .sort((a, b) => b[1].vitorias - a[1].vitorias)
        .slice(0, 10);

      if (ranking.length === 0)
        return interaction.reply("❌ Ainda sem ranking.");

      let texto = ranking.map((u, i) =>
        `${i + 1}º - <@${u[0]}> | 🏆 ${u[1].vitorias}`
      ).join("\n");

      return interaction.reply(`🏆 Ranking:\n\n${texto}`);
    }

    // ================= CONFIG TAXA =================
    if (interaction.commandName === "configtaxa") {
      if (!isDono(interaction.member))
        return interaction.reply({ content: "❌ Apenas dono.", ephemeral: true });

      const valor = interaction.options.getNumber("valor");
      setTaxa(valor);

      return interaction.reply(`✅ Nova taxa: ${valor}`);
    }

    // ================= CAIXA =================
    if (interaction.commandName === "caixa") {
      return interaction.reply(`🏢 Caixa da ORG: ${getCaixa().toFixed(2)}`);
    }

    // ================= CRIAR FILA =================
    if (interaction.commandName === "criarfila") {

      if (!isDono(interaction.member))
        return interaction.reply({ content: "❌ Apenas dono.", ephemeral: true });

      if (filaAtiva)
        return interaction.reply({ content: "❌ Já existe fila ativa.", ephemeral: true });

      const modo = interaction.options.getString("modo");
      const valor = interaction.options.getNumber("valor");

      filaAtiva = {
        modo,
        valorBase: valor,
        jogadores: [],
        mediador: null
      };

      const taxa = getTaxa();
      const total = valor + taxa;

      const embed = new EmbedBuilder()
        .setTitle("🔥 Fila Aberta")
        .setDescription(
          `🎮 Modo: ${modo}\n` +
          `💰 Valor Base: ${valor}\n` +
          `🏢 Taxa: ${taxa}\n` +
          `💵 Total: ${total}\n\n` +
          `👥 Jogadores: 0/2`
        )
        .setColor("Red");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("entrar_fila")
          .setLabel("Entrar")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("mediador_fila")
          .setLabel("Mediador")
          .setStyle(ButtonStyle.Primary)
      );

      return interaction.reply({ embeds: [embed], components: [row] });
    }

    // ================= VENCEDOR =================
    if (interaction.commandName === "vencedor") {

      if (!filaAtiva)
        return interaction.reply({ content: "❌ Nenhuma fila ativa.", ephemeral: true });

      if (!isMediador(interaction.member))
        return interaction.reply({ content: "❌ Apenas mediador.", ephemeral: true });

      const vencedor = interaction.options.getUser("usuario");

      if (!filaAtiva.jogadores.includes(vencedor.id))
        return interaction.reply({ content: "❌ Não está na partida.", ephemeral: true });

      const valorBase = filaAtiva.valorBase;
      const taxa = getTaxa();

      const premio = valorBase * 2;
      const lucroOrg = taxa * 2;

      addSaldo(vencedor.id, premio);
      addCaixa(lucroOrg);

      db.users[vencedor.id].vitorias += 1;
      saveDB(db);

      filaAtiva = null;

      return interaction.reply(
        `🏆 ${vencedor} venceu!\n💰 Recebeu ${premio}\n🏢 Org ganhou ${lucroOrg}`
      );
    }

    // ================= PIX =================
    if (interaction.commandName === "pix") {
      if (!isMediador(interaction.member))
        return interaction.reply({ content: "❌ Apenas mediador.", ephemeral: true });

      const chave = interaction.options.getString("chave");
      db.users[interaction.user.id].pix = chave;
      saveDB(db);

      return interaction.reply("✅ PIX configurado com sucesso.");
    }

    // ================= ROLETA =================
    if (interaction.commandName === "roleta") {

      const valor = interaction.options.getNumber("valor");
      const user = getUser(interaction.user.id);

      if (user.saldo < valor)
        return interaction.reply({ content: "❌ Saldo insuficiente.", ephemeral: true });

      removeSaldo(interaction.user.id, valor);

      const ganhou = Math.random() < 0.5;

      if (ganhou) {
        const premio = valor * 2;
        addSaldo(interaction.user.id, premio);
        return interaction.reply(`🎰 Você ganhou ${premio}!`);
      } else {
        addCaixa(valor);
        return interaction.reply("🎰 Você perdeu! Boa sorte na próxima.");
      }
    }

  }

  // ================= BOTÕES FILA =================
  if (interaction.isButton()) {

    if (!filaAtiva)
      return interaction.reply({ content: "❌ Nenhuma fila ativa.", ephemeral: true });

    if (interaction.customId === "entrar_fila") {

      if (filaAtiva.jogadores.includes(interaction.user.id))
        return interaction.reply({ content: "⚠️ Já entrou.", ephemeral: true });

      if (filaAtiva.jogadores.length >= 2)
        return interaction.reply({ content: "❌ Fila cheia.", ephemeral: true });

      const taxa = getTaxa();
      const total = filaAtiva.valorBase + taxa;
      const user = getUser(interaction.user.id);

      if (user.saldo < total)
        return interaction.reply({ content: "❌ Saldo insuficiente.", ephemeral: true });

      removeSaldo(interaction.user.id, total);
      filaAtiva.jogadores.push(interaction.user.id);

      if (filaAtiva.jogadores.length === 2) {
        return interaction.update({
          content: "🔥 Fila fechada! Aguardando mediador confirmar.",
          embeds: [],
          components: []
        });
      }

      return interaction.reply({ content: "✅ Entrou na fila!", ephemeral: true });
    }

    if (interaction.customId === "mediador_fila") {

      if (!isMediador(interaction.member))
        return interaction.reply({ content: "❌ Apenas mediador.", ephemeral: true });

      filaAtiva.mediador = interaction.user.id;

      return interaction.reply({ content: "✅ Você assumiu como mediador.", ephemeral: true });
    }

  }

});
// ===============================
// 🎛️ PAINEL CENTRAL
// ===============================

client.once("ready", () => {
  console.log(`🔥 Bot online como ${client.user.tag}`);
});

// ===============================
// 🎟️ SISTEMA DE TICKET
// ===============================

client.on("interactionCreate", async interaction => {

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "ticket") {

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("abrir_ticket")
          .setLabel("🎟️ Abrir Ticket")
          .setStyle(ButtonStyle.Primary)
      );

      return interaction.reply({
        content: "Clique abaixo para abrir um ticket.",
        components: [row]
      });
    }
  }

  if (interaction.isButton()) {

    if (interaction.customId === "abrir_ticket") {

      const nomeCanal = `ticket-${interaction.user.username}`;

      const canal = await interaction.guild.channels.create({
        name: nomeCanal,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: ["ViewChannel"]
          },
          {
            id: interaction.user.id,
            allow: ["ViewChannel", "SendMessages"]
          }
        ]
      });

      const embed = new EmbedBuilder()
        .setTitle("🎟️ Ticket Aberto")
        .setDescription("Descreva seu problema.\nUm staff irá ajudar.")
        .setColor("Blue");

      const fechar = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("fechar_ticket")
          .setLabel("❌ Fechar Ticket")
          .setStyle(ButtonStyle.Danger)
      );

      await canal.send({ embeds: [embed], components: [fechar] });

      return interaction.reply({ content: `✅ Ticket criado: ${canal}`, ephemeral: true });
    }

    if (interaction.customId === "fechar_ticket") {

      if (!interaction.channel.name.startsWith("ticket-"))
        return interaction.reply({ content: "❌ Não é um ticket.", ephemeral: true });

      await interaction.reply("🔒 Fechando ticket...");
      setTimeout(() => {
        interaction.channel.delete();
      }, 2000);
    }
  }

});

// ===============================
// 🔑 LOGIN FINAL
// ===============================

client.login(TOKEN);
