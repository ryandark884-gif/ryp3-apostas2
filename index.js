const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
  REST,
  Routes,
  PermissionsBitField,
  ChannelType
} = require("discord.js")

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

const TOKEN = "process.env.TOKEN"
const CLIENT_ID = "process.env.CLIENT_ID"
const GUILD_ID = "process.env.GUILD_ID"

let ticketConfig = {
  descricao: "Selecione uma opção para abrir ticket",
  imagem: "https://i.supaimg.com/4094cff7-47c8-488d-8754-3d34606a8df4/8cabf436-ce4a-497a-9f69-975fbdd829ab.png"
}

const commands = [
  new SlashCommandBuilder().setName("help").setDescription("Ver comandos"),
  new SlashCommandBuilder().setName("ticket").setDescription("Abrir painel de ticket"),
  new SlashCommandBuilder().setName("painelticket")
    .setDescription("Configurar ticket")
    .addStringOption(o => o.setName("descricao").setDescription("Nova descrição").setRequired(false))
    .addStringOption(o => o.setName("imagem").setDescription("URL da imagem").setRequired(false)),

  new SlashCommandBuilder().setName("avatar")
    .setDescription("Ver avatar")
    .addUserOption(o => o.setName("usuario").setDescription("Usuário")),

  new SlashCommandBuilder().setName("userinfo")
    .setDescription("Info do usuário")
    .addUserOption(o => o.setName("usuario").setDescription("Usuário")),

  new SlashCommandBuilder().setName("serverinfo")
    .setDescription("Info do servidor"),

  new SlashCommandBuilder().setName("limpar")
    .setDescription("Apagar mensagens")
    .addIntegerOption(o => o.setName("quantidade").setDescription("Quantidade").setRequired(true)),

  new SlashCommandBuilder().setName("enviarmensagem")
    .setDescription("Enviar mensagem")
    .addStringOption(o => o.setName("mensagem").setDescription("Mensagem").setRequired(true))
].map(c => c.toJSON())

const rest = new REST({ version: "10" }).setToken(TOKEN)

client.once("ready", async () => {
  console.log(`Bot online: ${client.user.tag}`)

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  )
})

client.on("interactionCreate", async (interaction) => {

  // COMANDOS
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "help") {
      return interaction.reply("Comandos: /ticket /painelticket /avatar /userinfo /serverinfo /limpar")
    }

    if (interaction.commandName === "painelticket") {
      const desc = interaction.options.getString("descricao")
      const img = interaction.options.getString("imagem")

      if (desc) ticketConfig.descricao = desc
      if (img) ticketConfig.imagem = img

      return interaction.reply("Painel atualizado!")
    }

    if (interaction.commandName === "ticket") {

      const embed = new EmbedBuilder()
        .setTitle("Central de Atendimento")
        .setDescription(ticketConfig.descricao)
        .setImage(ticketConfig.imagem)

      const menu = new StringSelectMenuBuilder()
        .setCustomId("ticket_menu")
        .setPlaceholder("Escolha uma opção")
        .addOptions([
          { label: "SUPORTE", value: "suporte" },
          { label: "REEMBOLSO", value: "reembolso" },
          { label: "VAGAS", value: "vagas" },
          { label: "PREMIAÇÕES", value: "premio" }
        ])

      const row = new ActionRowBuilder().addComponents(menu)

      return interaction.reply({ embeds: [embed], components: [row] })
    }

  } // ← ESSA CHAVE TAVA FALTANDO

  // MENU
  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === "ticket_menu") {

      const categoria = interaction.guild.channels.cache.find(c => c.name === "╭─ 🛎️・ATENDIMENTO")

      const canal = await interaction.guild.channels.create({
  name: `ticket-${interaction.user.username}`,
  type: ChannelType.GuildText,
  parent: categoria ? categoria.id : null,
  permissionOverwrites: [
    {
      id: interaction.guild.id,
      deny: [PermissionsBitField.Flags.ViewChannel]
    },
    {
      id: interaction.user.id,
      allow: [PermissionsBitField.Flags.ViewChannel]
    }
  ]
})

      const botoes = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("fechar").setLabel("Fechar").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("assumir").setLabel("Assumir").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("add").setLabel("Adicionar").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("notificar").setLabel("Notificar").setStyle(ButtonStyle.Success)
      )

      await canal.send({
        content: `Ticket de ${interaction.user}`,
        components: [botoes]
      })

      return interaction.reply({ content: "Ticket criado!", ephemeral: true })
    }
  }

  // BOTÕES
  if (interaction.isButton()) {

    if (interaction.customId === "fechar") {
      return interaction.channel.delete()
    }

    if (interaction.customId === "assumir") {
      return interaction.reply("Ticket assumido!")
    }

    if (interaction.customId === "add") {
      return interaction.reply("Use comando manual para adicionar alguém")
    }

    if (interaction.customId === "notificar") {
      return interaction.reply("@here atendimento solicitado!")
    }
  }

})

client.login(TOKEN)
