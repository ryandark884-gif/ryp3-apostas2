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

const TOKEN = process.env.TOKEN
const CLIENT_ID = process.env.CLIENT_ID
const GUILD_ID = process.env.GUILD_ID

let ticketConfig = {
  descricao: "Selecione uma opção para abrir ticket",
  imagem: "https://i.supaimg.com/4094cff7-47c8-488d-8754-3d34606a8df4/8cabf436-ce4a-497a-9f69-975fbdd829ab.png"
}

const commands = [
  new SlashCommandBuilder().setName("help").setDescription("Ver comandos"),
  new SlashCommandBuilder().setName("ticket").setDescription("Abrir painel de ticket"),
  new SlashCommandBuilder().setName("painelticket")
    .setDescription("Configurar ticket")
    .addStringOption(o => o.setName("descricao").setDescription("Nova descrição"))
    .addStringOption(o => o.setName("imagem").setDescription("URL da imagem")),

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

      await interaction.deferReply()

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

      return interaction.editReply({ embeds: [embed], components: [row] })
    }

    if (interaction.commandName === "avatar") {
      const user = interaction.options.getUser("usuario") || interaction.user
      return interaction.reply(user.displayAvatarURL({ size: 512 }))
    }

    if (interaction.commandName === "userinfo") {
      const user = interaction.options.getUser("usuario") || interaction.user
      return interaction.reply(`Usuário: ${user.tag}\nID: ${user.id}`)
    }

    if (interaction.commandName === "serverinfo") {
      return interaction.reply(`Servidor: ${interaction.guild.name}\nMembros: ${interaction.guild.memberCount}`)
    }

    if (interaction.commandName === "limpar") {
      const quantidade = interaction.options.getInteger("quantidade")
      await interaction.channel.bulkDelete(quantidade, true)
      return interaction.reply({ content: "Mensagens apagadas!", ephemeral: true })
    }

    if (interaction.commandName === "enviarmensagem") {
      const msg = interaction.options.getString("mensagem")
      await interaction.channel.send(msg)
      return interaction.reply({ content: "Mensagem enviada!", ephemeral: true })
    }
  }

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
        new ButtonBuilder()
          .setCustomId(`fechar_${interaction.user.id}`)
          .setLabel("Fechar")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
          .setCustomId(`assumir_${interaction.user.id}`)
          .setLabel("Assumir")
          .setEmoji("👨‍💼")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId(`add_${interaction.user.id}`)
          .setLabel("Adicionar")
          .setEmoji("➕")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId(`notificar_${interaction.user.id}`)
          .setLabel("Notificar")
          .setEmoji("📢")
          .setStyle(ButtonStyle.Success)
      )

      await canal.send({
        content: `Ticket de ${interaction.user}`,
        components: [botoes]
      })

      return interaction.reply({ content: "Ticket criado!", ephemeral: true })
    }
  }

  if (interaction.isButton()) {

    const [acao, userId] = interaction.customId.split("_")

    if (acao === "fechar") {
      return interaction.channel.delete()
    }

    if (acao === "assumir") {
      return interaction.reply("Ticket assumido!")
    }

    if (acao === "add") {
      return interaction.reply("Use comando manual para adicionar alguém")
    }

    if (acao === "notificar") {
      try {
        const user = await client.users.fetch(userId)

        await user.send(`Você abriu um ticket no servidor ${interaction.guild.name}! Aguarde atendimento.`)

        return interaction.reply({ content: "Usuário notificado na DM!", ephemeral: true })

      } catch {
        return interaction.reply({ content: "Não consegui enviar DM para o usuário!", ephemeral: true })
      }
    }
  }

})

client.login(TOKEN)
