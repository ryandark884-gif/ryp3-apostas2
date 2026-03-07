const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
StringSelectMenuBuilder,
ButtonBuilder,
ButtonStyle,
PermissionsBitField,
SlashCommandBuilder,
REST,
Routes,
ChannelType
} = require("discord.js")

const TOKEN = process.env.TOKEN
const CLIENT_ID = process.env.CLIENT_ID
const GUILD_ID = process.env.GUILD_ID

const STAFF_ROLE = "1463148647972737118"
const LOG_CHANNEL = "1473752371128696885"

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildMembers
]
})

/* ================= COMANDOS ================= */

const commands = [

new SlashCommandBuilder()
.setName("ticket")
.setDescription("Enviar painel de tickets"),

new SlashCommandBuilder()
.setName("enviarmensagem")
.setDescription("Enviar uma mensagem pelo bot")
.addStringOption(option =>
option.setName("mensagem")
.setDescription("Mensagem que o bot vai enviar")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("limpar")
.setDescription("Apagar mensagens")
.addIntegerOption(option =>
option.setName("quantidade")
.setDescription("Quantidade de mensagens")
.setRequired(true)
)

].map(cmd => cmd.toJSON())

const rest = new REST({ version: "10" }).setToken(TOKEN)

;(async () => {

await rest.put(
Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
{ body: commands }
)

console.log("✅ Comandos registrados")

})()

/* ================= BOT ONLINE ================= */

client.once("ready", () => {

console.log(`🤖 Bot online como ${client.user.tag}`)

})

/* ================= COMANDOS ================= */

client.on("interactionCreate", async interaction => {

if (!interaction.isChatInputCommand()) return

/* ===== PAINEL TICKET ===== */

if (interaction.commandName === "ticket") {

const embed = new EmbedBuilder()
.setTitle("📩 Central de Atendimento")
.setDescription(`Selecione abaixo o tipo de atendimento.`)
.setColor("Blue")

const menu = new ActionRowBuilder().addComponents(

new StringSelectMenuBuilder()
.setCustomId("menu_ticket")
.setPlaceholder("Selecione uma opção")
.addOptions([
{ label:"⚒️ | SUPORTE", value:"suporte" },
{ label:"💸 | REEMBOLSO", value:"reembolso" },
{ label:"👤 | VAGAS", value:"vagas" },
{ label:"💰 | RECEBER PREMIAÇÕES", value:"premio" }
])

)

interaction.reply({ embeds:[embed], components:[menu] })

}

/* ===== ENVIAR MENSAGEM ===== */

if (interaction.commandName === "enviarmensagem") {

if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

return interaction.reply({
content:"❌ Apenas administradores podem usar.",
ephemeral:true
})

}

const msg = interaction.options.getString("mensagem")

await interaction.channel.send(msg)

interaction.reply({
content:"✅ Mensagem enviada.",
ephemeral:true
})

}

/* ===== LIMPAR CHAT ===== */

if (interaction.commandName === "limpar") {

if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {

return interaction.reply({
content:"❌ Você não pode usar isso.",
ephemeral:true
})

}

const quantidade = interaction.options.getInteger("quantidade")

await interaction.channel.bulkDelete(quantidade)

interaction.reply({
content:`🧹 ${quantidade} mensagens apagadas.`,
ephemeral:true
})

}

})

/* ================= MENU TICKET ================= */

client.on("interactionCreate", async interaction => {

if (!interaction.isStringSelectMenu()) return

if (interaction.customId === "menu_ticket") {

const user = interaction.user

const ticketExistente = interaction.guild.channels.cache.find(
c => c.topic === user.id
)

if (ticketExistente) {

return interaction.reply({
content:`❌ Você já possui um ticket aberto: ${ticketExistente}`,
ephemeral:true
})

}

const canal = await interaction.guild.channels.create({
name:`ticket-${user.username}`,
topic:user.id,
type:ChannelType.GuildText,
permissionOverwrites:[
{
id:interaction.guild.id,
deny:[PermissionsBitField.Flags.ViewChannel]
},
{
id:user.id,
allow:[
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
},
{
id:STAFF_ROLE,
allow:[
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
}
]
})

const embed = new EmbedBuilder()
.setTitle("🎫 Ticket aberto")
.setDescription(`👤 Usuário: ${user}

Aguarde um administrador.`)
.setColor("Green")

const botoes = new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("fechar_ticket")
.setLabel("🚫 | FECHAR TICKET")
.setStyle(ButtonStyle.Danger),

new ButtonBuilder()
.setCustomId("notificar_user")
.setLabel("👤 | NOTIFICAR USUÁRIO")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("add_user")
.setLabel("🚨 | ADICIONAR USUÁRIO")
.setStyle(ButtonStyle.Secondary)

)

canal.send({ embeds:[embed], components:[botoes] })

interaction.reply({
content:`✅ Ticket criado: ${canal}`,
ephemeral:true
})

const log = interaction.guild.channels.cache.get(LOG_CHANNEL)

if (log) {
log.send(`📂 Ticket aberto por ${user}`)
}

}

})

/* ================= BOTÕES ================= */

client.on("interactionCreate", async interaction => {

if (!interaction.isButton()) return

if (!interaction.member.roles.cache.has(STAFF_ROLE)) {

return interaction.reply({
content:"❌ Apenas STAFF pode usar estes botões.",
ephemeral:true
})

}

/* FECHAR */

if (interaction.customId === "fechar_ticket") {

const log = interaction.guild.channels.cache.get(LOG_CHANNEL)

if (log) {
log.send(`🔒 Ticket fechado por ${interaction.user}`)
}

interaction.channel.delete()

}

/* NOTIFICAR */

if (interaction.customId === "notificar_user") {

const userId = interaction.channel.topic

const membro = await interaction.guild.members.fetch(userId)

try {

await membro.send(
`📩 Olá!

Seu ticket no servidor **${interaction.guild.name}** recebeu uma atualização.

Acesse o ticket para ver a resposta da equipe.`
)

interaction.reply({
content:"✅ Usuário notificado no privado.",
ephemeral:true
})

} catch {

interaction.reply({
content:"❌ Não consegui enviar mensagem privada.",
ephemeral:true
})

}

}

/* ADICIONAR USUÁRIO */

if (interaction.customId === "add_user") {

interaction.reply({
content:"⚠️ Use o comando `/adicionar @usuario` para adicionar alguém ao ticket.",
ephemeral:true
})

}

})

client.login(TOKEN)
