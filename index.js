const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
StringSelectMenuBuilder,
PermissionsBitField,
ChannelType,
SlashCommandBuilder,
REST,
Routes
} = require("discord.js")

const TOKEN = process.env.TOKEN
const CLIENT_ID = process.env.CLIENT_ID
const GUILD_ID = process.env.GUILD_ID

const STAFF_ROLE = "1463198259186106429"

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
GatewayIntentBits.MessageContent,
]
})

const commands = [

new SlashCommandBuilder().setName("help").setDescription("Ver comandos"),

new SlashCommandBuilder().setName("ticket").setDescription("Abrir painel de ticket"),

new SlashCommandBuilder().setName("painelticket").setDescription("Configurar painel"),

new SlashCommandBuilder()
.setName("limpar")
.setDescription("Apagar mensagens")
.addIntegerOption(o=>o.setName("quantidade").setDescription("Quantidade").setRequired(true)),

new SlashCommandBuilder()
.setName("enviarmensagem")
.setDescription("Enviar mensagem")
.addStringOption(o=>o.setName("mensagem").setDescription("Mensagem").setRequired(true)),

new SlashCommandBuilder()
.setName("avatar")
.setDescription("Avatar")
.addUserOption(o=>o.setName("usuario").setDescription("Usuário")),

new SlashCommandBuilder()
.setName("userinfo")
.setDescription("Informações")
.addUserOption(o=>o.setName("usuario").setDescription("Usuário")),

new SlashCommandBuilder()
.setName("serverinfo")
.setDescription("Servidor"),

new SlashCommandBuilder()
.setName("embed")
.setDescription("Enviar embed")
.addStringOption(o=>o.setName("titulo").setDescription("Título").setRequired(true))
.addStringOption(o=>o.setName("descricao").setDescription("Descrição").setRequired(true)),

].map(c=>c.toJSON())

const rest = new REST({version:"10"}).setToken(TOKEN)

client.once("ready", async () => {

console.log(`Bot online como ${client.user.tag}`)

await rest.put(
Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
{body:commands}
)

})

client.on("interactionCreate", async interaction => {

if(!interaction.isChatInputCommand()) return

if(interaction.commandName === "help"){
interaction.reply("Comandos: /ticket /painelticket /limpar /enviarmensagem")
}

if(interaction.commandName === "ticket"){

const embed = new EmbedBuilder()
.setTitle("Central de Atendimento")
.setDescription(ticketConfig.descricao)
.setImage(ticketConfig.imagem)

const menu = new StringSelectMenuBuilder()
.setCustomId("ticket_menu")
.setPlaceholder("Escolha uma opção")
.addOptions([
{label:"SUPORTE",emoji:"⚒️",value:"suporte"},
{label:"REEMBOLSO",emoji:"💸",value:"reembolso"},
{label:"VAGAS",emoji:"👤",value:"vagas"},
{label:"PREMIAÇÕES",emoji:"💰",value:"premio"}
])

const row = new ActionRowBuilder().addComponents(menu)

interaction.reply({embeds:[embed],components:[row]})

}

if(interaction.commandName === "painelticket"){

if(!interaction.member.roles.cache.has(STAFF_ROLE))
return interaction.reply({content:"Apenas staff pode usar",ephemeral:true})

const row = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("config_desc").setLabel("✏️ Descrição").setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId("config_img").setLabel("🖼️ Imagem").setStyle(ButtonStyle.Secondary)
)

interaction.reply({content:"Configurar painel:",components:[row],ephemeral:true})

}

if(interaction.isStringSelectMenu()){

if(interaction.customId === "ticket_menu"){

ticketCount++

const categoria = interaction.guild.channels.cache.find(c => c.name === "╭─ 🛎️・ATENDIMENTO")

const canal = await interaction.guild.channels.create({
name:`ticket-${ticketCount}`,
type:ChannelType.GuildText,
parent:categoria ? categoria.id : null,
permissionOverwrites:[
{ id:interaction.guild.id, deny:[PermissionsBitField.Flags.ViewChannel]},
{ id:interaction.user.id, allow:[PermissionsBitField.Flags.ViewChannel]},
{ id:STAFF_ROLE, allow:[PermissionsBitField.Flags.ViewChannel]}
]
})

const row = new ActionRowBuilder().addComponents(

new ButtonBuilder().setCustomId("fechar_ticket").setLabel("🚫 Fechar").setStyle(ButtonStyle.Danger),
new ButtonBuilder().setCustomId("notificar_usuario").setLabel("👤 Notificar").setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId("add_usuario").setLabel("➕ Adicionar").setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId("claim_ticket").setLabel("📌 Reivindicar").setStyle(ButtonStyle.Success)

)

canal.send({content:`Ticket de ${interaction.user}`,components:[row]})

interaction.reply({content:`Ticket criado: ${canal}`,ephemeral:true})

}

}

if(interaction.isButton()){

if(!interaction.member.roles.cache.has(STAFF_ROLE))
return interaction.reply({content:"Apenas staff pode usar",ephemeral:true})

// FECHAR
if(interaction.customId === "fechar_ticket"){
return interaction.channel.delete()
}

// NOTIFICAR
if(interaction.customId === "notificar_usuario"){

const user = interaction.channel.permissionOverwrites.cache
.find(p => p.type === 1)

if(!user) return

const membro = await client.users.fetch(user.id)

membro.send("Seu ticket recebeu atualização!")

return interaction.reply({content:"Usuário notificado!",ephemeral:true})
}

// ADICIONAR
if(interaction.customId === "add_usuario"){

await interaction.reply({content:"Marque o usuário:",ephemeral:true})

const filter = m => m.author.id === interaction.user.id

const collector = interaction.channel.createMessageCollector({filter,max:1})

collector.on("collect", async msg => {

const user = msg.mentions.users.first()
if(!user) return msg.reply("Usuário inválido")

await interaction.channel.permissionOverwrites.create(user.id,{
ViewChannel:true
})

msg.reply(`✅ ${user} adicionado ao ticket`)
})

}

// CLAIM
if(interaction.customId === "claim_ticket"){
interaction.channel.send(`📌 Ticket assumido por ${interaction.user}`)
interaction.reply({content:"Ticket reivindicado!",ephemeral:true})
}

// CONFIG DESCRIÇÃO
if(interaction.customId === "config_desc"){

interaction.reply({content:"Digite a nova descrição:",ephemeral:true})

const filter = m => m.author.id === interaction.user.id

const collector = interaction.channel.createMessageCollector({filter,max:1})

collector.on("collect", m=>{
ticketConfig.descricao = m.content
m.reply("Descrição atualizada!")
})

}

// CONFIG IMAGEM
if(interaction.customId === "config_img"){

interaction.reply({content:"Envie o link da imagem:",ephemeral:true})

const filter = m => m.author.id === interaction.user.id

const collector = interaction.channel.createMessageCollector({filter,max:1})

collector.on("collect", m=>{
ticketConfig.imagem = m.content
m.reply("Imagem atualizada!")
})

}

}

})

client.login(TOKEN)
