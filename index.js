const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
StringSelectMenuBuilder,
UserSelectMenuBuilder,
PermissionsBitField,
ChannelType,
SlashCommandBuilder,
REST,
Routes
} = require("discord.js")

const TOKEN = process.env.TOKEN
const CLIENT_ID = process.env.CLIENT_ID
const GUILD_ID = process.env.GUILD_ID

const STAFF_ROLES = ["Holy", "owner"]

let ticketCount = 0

let ticketConfig = {
descricao: "Selecione uma opção para abrir ticket",
imagem: "https://i.supaimg.com/4094cff7-47c8-488d-8754-3d34606a8df4/8cabf436-ce4a-497a-9f69-975fbdd829ab.png"
}

const client = new Client({
intents:[
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]
})

const commands = [

new SlashCommandBuilder().setName("help").setDescription("Ver comandos"),
new SlashCommandBuilder().setName("ticket").setDescription("Abrir painel de ticket"),
new SlashCommandBuilder().setName("painelticket").setDescription("Configurar painel de ticket"),

new SlashCommandBuilder()
.setName("limpar")
.setDescription("Apagar mensagens")
.addIntegerOption(o=>o.setName("quantidade").setDescription("Quantidade").setRequired(true)),

new SlashCommandBuilder()
.setName("enviarmensagem")
.setDescription("Enviar mensagem pelo bot")
.addStringOption(o=>o.setName("mensagem").setDescription("Mensagem").setRequired(true)),

new SlashCommandBuilder()
.setName("avatar")
.setDescription("Ver avatar")
.addUserOption(o=>o.setName("usuario").setDescription("Usuário")),

new SlashCommandBuilder()
.setName("userinfo")
.setDescription("Informações do usuário")
.addUserOption(o=>o.setName("usuario").setDescription("Usuário")),

new SlashCommandBuilder()
.setName("serverinfo")
.setDescription("Informações do servidor"),

new SlashCommandBuilder()
.setName("embed")
.setDescription("Enviar embed")
.addStringOption(o=>o.setName("titulo").setDescription("Título").setRequired(true))
.addStringOption(o=>o.setName("descricao").setDescription("Descrição").setRequired(true))

].map(c=>c.toJSON())

const rest = new REST({version:"10"}).setToken(TOKEN)

client.once("ready", async () => {

console.log(`Bot online como ${client.user.tag}`)

// 🔥 SERVIDOR PRINCIPAL
await rest.put(
Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
{body:commands}
)

// 🔥 TODOS SERVIDORES (instantâneo)
client.guilds.cache.forEach(async (guild) => {
await rest.put(
Routes.applicationGuildCommands(CLIENT_ID, guild.id),
{body:commands}
)
})

})

// 🔥 NOVOS SERVIDORES AUTOMÁTICO
client.on("guildCreate", async (guild) => {
await rest.put(
Routes.applicationGuildCommands(CLIENT_ID, guild.id),
{body:commands}
)
})

client.on("interactionCreate", async interaction => {

if(interaction.isChatInputCommand()){

if(interaction.commandName === "help"){
return interaction.reply("Comandos: /ticket /painelticket /limpar /enviarmensagem /avatar /userinfo /serverinfo")
}

if(interaction.commandName === "painelticket"){

const embed = new EmbedBuilder()
.setTitle("Painel de Configuração")
.setDescription("Configure o ticket abaixo")

const row = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("config_desc").setLabel("📝 Alterar Descrição").setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId("config_img").setLabel("🖼️ Alterar Imagem").setStyle(ButtonStyle.Secondary)
)

return interaction.reply({embeds:[embed],components:[row]})
}

if(interaction.commandName === "ticket"){

const embed = new EmbedBuilder()
.setTitle("Central de Atendimento")
.setDescription(ticketConfig.descricao)
.setImage(ticketConfig.imagem)

const menu = new StringSelectMenuBuilder()
.setCustomId("ticket_menu")
.addOptions([
{label:"SUPORTE",emoji:"⚒️",value:"suporte"},
{label:"REEMBOLSO",emoji:"💸",value:"reembolso"},
{label:"VAGAS",emoji:"👤",value:"vagas"},
{label:"PREMIAÇÕES",emoji:"💰",value:"premio"}
])

const row = new ActionRowBuilder().addComponents(menu)

return interaction.reply({embeds:[embed],components:[row]})
}

}

// CONFIG PAINEL
if(interaction.isButton()){

if(interaction.customId === "config_desc"){
await interaction.reply({content:"Digite a nova descrição:",ephemeral:true})
const filter = m => m.author.id === interaction.user.id
const collector = interaction.channel.createMessageCollector({filter,time:30000,max:1})
collector.on("collect", msg => {
ticketConfig.descricao = msg.content
msg.reply("Descrição atualizada!")
})
}

if(interaction.customId === "config_img"){
await interaction.reply({content:"Envie a URL da nova imagem:",ephemeral:true})
const filter = m => m.author.id === interaction.user.id
const collector = interaction.channel.createMessageCollector({filter,time:30000,max:1})
collector.on("collect", msg => {
ticketConfig.imagem = msg.content
msg.reply("Imagem atualizada!")
})
}

}

// MENU TICKET
if(interaction.isStringSelectMenu() && interaction.customId === "ticket_menu"){

ticketCount++

const canal = await interaction.guild.channels.create({
name:`ticket-${ticketCount}`,
type:ChannelType.GuildText,
permissionOverwrites:[
{ id:interaction.guild.id, deny:[PermissionsBitField.Flags.ViewChannel] },
{ id:interaction.user.id, allow:[PermissionsBitField.Flags.ViewChannel] }
]
})

const row = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("fechar_ticket").setLabel("🚫 Fechar").setStyle(ButtonStyle.Danger),
new ButtonBuilder().setCustomId("notificar_usuario").setLabel("👤 Notificar").setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId("assumir_ticket").setLabel("📌 Assumir").setStyle(ButtonStyle.Success)
)

const row2 = new ActionRowBuilder().addComponents(
new UserSelectMenuBuilder()
.setCustomId("add_user_select")
.setPlaceholder("Selecionar usuário")
)

await canal.send({content:`Ticket de ${interaction.user}`,components:[row,row2]})

return interaction.reply({content:"Ticket criado!",ephemeral:true})
}

// BOTÕES + MENU
if(interaction.isButton() || interaction.isUserSelectMenu()){

const hasStaff = STAFF_ROLES.some(r =>
interaction.member.roles.cache.some(role => role.name.toLowerCase() === r.toLowerCase())
)

if(!hasStaff) return interaction.reply({content:"Apenas staff",ephemeral:true})

if(interaction.isButton()){

if(interaction.customId === "fechar_ticket"){
return interaction.channel.delete()
}

if(interaction.customId === "notificar_usuario"){
interaction.reply({content:"Usuário notificado!",ephemeral:true})
}

if(interaction.customId === "assumir_ticket"){
interaction.reply({content:"Ticket assumido!",ephemeral:true})
}

}

if(interaction.isUserSelectMenu() && interaction.customId === "add_user_select"){

for(const userId of interaction.values){
await interaction.channel.permissionOverwrites.edit(userId,{
ViewChannel:true
})
}

interaction.reply({content:"Usuário adicionado!",ephemeral:true})
}

}

})

client.login(TOKEN)
