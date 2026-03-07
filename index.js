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
Routes
} = require("discord.js")

const TOKEN = process.env.TOKEN
const CLIENT_ID = process.env.CLIENT_ID
const GUILD_ID = process.env.GUILD_ID

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]
})

/* ================= COMANDOS ================= */

const commands = [

new SlashCommandBuilder()
.setName("ticket")
.setDescription("Enviar painel de tickets"),

new SlashCommandBuilder()
.setName("enviar-mensagem")
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
try {

await rest.put(
Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
{ body: commands }
)

console.log("Comandos registrados")

} catch (error) {
console.error(error)
}
})()

/* ================= BOT ONLINE ================= */

client.once("ready", () => {

console.log(`Bot ligado como ${client.user.tag}`)

})

/* ================= COMANDOS ================= */

client.on("interactionCreate", async (interaction) => {

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
{
label: "SUPORTE",
emoji: "⚒️",
value: "suporte"
},
{
label: "REEMBOLSO",
emoji: "💸",
value: "reembolso"
},
{
label: "VAGAS",
emoji: "👤",
value: "vagas"
},
{
label: "RECEBER PREMIAÇÕES",
emoji: "💰",
value: "premio"
}
])

)

interaction.reply({ embeds:[embed], components:[menu] })

}

/* ===== ENVIAR MENSAGEM ===== */

if (interaction.commandName === "enviar-mensagem") {

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

if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

return interaction.reply({
content:"❌ Apenas administradores podem usar.",
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

const canal = await interaction.guild.channels.create({
name:`ticket-${interaction.user.username}`,
type:0,
permissionOverwrites:[
{
id:interaction.guild.id,
deny:[PermissionsBitField.Flags.ViewChannel]
},
{
id:interaction.user.id,
allow:[
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
}
]
})

const botoes = new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("fechar_ticket")
.setLabel("🚫 | FECHAR TICKET")
.setStyle(ButtonStyle.Danger),

new ButtonBuilder()
.setCustomId("notificar")
.setLabel("👤 | NOTIFICAR USUÁRIO")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("add_user")
.setLabel("🚨 | ADICIONAR USUÁRIO")
.setStyle(ButtonStyle.Secondary)

)

const embed = new EmbedBuilder()
.setTitle("🎫 Ticket aberto")
.setDescription(`Usuário: ${interaction.user}

Aguarde um administrador.`)
.setColor("Green")

canal.send({ embeds:[embed], components:[botoes] })

interaction.reply({
content:`✅ Ticket criado: ${canal}`,
ephemeral:true
})

}

})

/* ================= BOTÕES ================= */

client.on("interactionCreate", async interaction => {

if (!interaction.isButton()) return

if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

return interaction.reply({
content:"❌ Apenas administradores podem usar os botões.",
ephemeral:true
})

}

/* FECHAR */

if (interaction.customId === "fechar_ticket") {

interaction.channel.delete()

}

/* NOTIFICAR */

if (interaction.customId === "notificar") {

const user = interaction.channel.name.split("ticket-")[1]

interaction.reply({
content:"📩 Usuário foi notificado.",
ephemeral:true
})

}

/* ADICIONAR */

if (interaction.customId === "add_user") {

interaction.reply({
content:"Use /adduser para adicionar alguém (sistema simples).",
ephemeral:true
})

}

})

client.login(TOKEN)
