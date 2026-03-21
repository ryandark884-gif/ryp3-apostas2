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

process.on("unhandledRejection", console.error)
process.on("uncaughtException", console.error)

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
GatewayIntentBits.MessageContent
]
})

const commands = [

new SlashCommandBuilder().setName("help").setDescription("Ver comandos"),

new SlashCommandBuilder().setName("ticket").setDescription("Abrir ticket"),

new SlashCommandBuilder().setName("painelticket").setDescription("Configurar ticket"),

new SlashCommandBuilder()
.setName("limpar")
.setDescription("Apagar mensagens")
.addIntegerOption(o=>o.setName("quantidade").setRequired(true)),

new SlashCommandBuilder()
.setName("enviarmensagem")
.setDescription("Enviar mensagem")
.addStringOption(o=>o.setName("mensagem").setRequired(true)),

new SlashCommandBuilder()
.setName("avatar")
.setDescription("Avatar")
.addUserOption(o=>o.setName("usuario")),

new SlashCommandBuilder()
.setName("userinfo")
.setDescription("Info usuário")
.addUserOption(o=>o.setName("usuario")),

new SlashCommandBuilder()
.setName("serverinfo")
.setDescription("Info servidor"),

new SlashCommandBuilder()
.setName("embed")
.setDescription("Criar embed")
.addStringOption(o=>o.setName("titulo").setRequired(true))
.addStringOption(o=>o.setName("descricao").setRequired(true))

].map(c=>c.toJSON())

const rest = new REST({version:"10"}).setToken(TOKEN)

client.once("ready", async () => {
console.log(`Bot online: ${client.user.tag}`)

await rest.put(
Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
{body:commands}
)
})

client.on("interactionCreate", async interaction => {


// ================= COMANDOS =================
if(interaction.isChatInputCommand()){

if(interaction.commandName === "help"){
return interaction.reply("Comandos: /ticket /painelticket /limpar /embed /avatar /userinfo /serverinfo")
}

if(interaction.commandName === "ticket"){

await interaction.deferReply()

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

return interaction.editReply({embeds:[embed],components:[row]})
}

if(interaction.commandName === "painelticket"){

await interaction.deferReply({ephemeral:true})

const row = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("config_desc").setLabel("✏️ Descrição").setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId("config_img").setLabel("🖼️ Imagem").setStyle(ButtonStyle.Secondary)
)

return interaction.editReply({content:"Configurar painel:",components:[row]})
}

if(interaction.commandName === "limpar"){
const q = interaction.options.getInteger("quantidade")
await interaction.channel.bulkDelete(q)
return interaction.reply({content:`Apaguei ${q} mensagens`,ephemeral:true})
}

if(interaction.commandName === "enviarmensagem"){
const msg = interaction.options.getString("mensagem")
interaction.channel.send(msg)
return interaction.reply({content:"Mensagem enviada",ephemeral:true})
}

if(interaction.commandName === "avatar"){
const user = interaction.options.getUser("usuario") || interaction.user
return interaction.reply(user.displayAvatarURL({size:512}))
}

if(interaction.commandName === "userinfo"){
const user = interaction.options.getUser("usuario") || interaction.user
return interaction.reply(`Nome: ${user.tag}\nID: ${user.id}`)
}

if(interaction.commandName === "serverinfo"){
return interaction.reply(`Servidor: ${interaction.guild.name}\nMembros: ${interaction.guild.memberCount}`)
}

if(interaction.commandName === "embed"){
const titulo = interaction.options.getString("titulo")
const desc = interaction.options.getString("descricao")

const embed = new EmbedBuilder()
.setTitle(titulo)
.setDescription(desc)
.setImage(ticketConfig.imagem)

interaction.channel.send({embeds:[embed]})

return interaction.reply({content:"Embed enviado",ephemeral:true})
}

}


// ================= MENU =================
if(interaction.isStringSelectMenu()){

if(interaction.customId === "ticket_menu"){

ticketCount++

const categoria = interaction.guild.channels.cache.find(c=>c.name==="╭─ 🛎️・ATENDIMENTO")

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

return interaction.reply({content:`Ticket criado: ${canal}`,ephemeral:true})
}

}


// ================= BOTÕES =================
if(interaction.isButton()){

if(!interaction.member.roles.cache.has(STAFF_ROLE))
return interaction.reply({content:"Apenas staff",ephemeral:true})

if(interaction.customId === "fechar_ticket"){
return interaction.channel.delete()
}

if(interaction.customId === "notificar_usuario"){

const user = interaction.channel.permissionOverwrites.cache.find(p=>p.type===1)
if(!user) return

const membro = await client.users.fetch(user.id)
membro.send("Seu ticket foi atualizado!")

return interaction.reply({content:"Notificado",ephemeral:true})
}

if(interaction.customId === "add_usuario"){

await interaction.reply({content:"Marque o usuário:",ephemeral:true})

const filter = m=>m.author.id===interaction.user.id

const collector = interaction.channel.createMessageCollector({filter,max:1})

collector.on("collect", async msg=>{
const user = msg.mentions.users.first()
if(!user) return msg.reply("Inválido")

await interaction.channel.permissionOverwrites.create(user.id,{ViewChannel:true})

msg.reply("Adicionado!")
})

}

if(interaction.customId === "claim_ticket"){
interaction.channel.send(`📌 Assumido por ${interaction.user}`)
interaction.reply({content:"Reivindicado",ephemeral:true})
}

if(interaction.customId === "config_desc"){

interaction.reply({content:"Digite nova descrição:",ephemeral:true})

const filter = m=>m.author.id===interaction.user.id

const collector = interaction.channel.createMessageCollector({filter,max:1})

collector.on("collect", m=>{
ticketConfig.descricao = m.content
m.reply("Atualizado!")
})

}

if(interaction.customId === "config_img"){

interaction.reply({content:"Envie link da imagem:",ephemeral:true})

const filter = m=>m.author.id===interaction.user.id

const collector = interaction.channel.createMessageCollector({filter,max:1})

collector.on("collect", m=>{
ticketConfig.imagem = m.content
m.reply("Imagem atualizada!")
})

}

}

})

client.login(TOKEN)
