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
Routes,
ModalBuilder,
TextInputBuilder,
TextInputStyle
} = require("discord.js")

const TOKEN = process.env.TOKEN
const CLIENT_ID = process.env.CLIENT_ID

// 🔥 AGORA SEM ID FIXO (VÁRIOS CARGOS)
const STAFF_ROLES = ["SUPORTE", "ADMIN", "MOD", "OWNER"]

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
new SlashCommandBuilder().setName("painel-ticket").setDescription("Configurar painel de ticket"),

new SlashCommandBuilder().setName("limpar")
.setDescription("Apagar mensagens")
.addIntegerOption(o=>o.setName("quantidade").setDescription("Quantidade").setRequired(true)),

new SlashCommandBuilder().setName("enviarmensagem")
.setDescription("Enviar mensagem pelo bot")
.addStringOption(o=>o.setName("mensagem").setDescription("Mensagem").setRequired(true)),

new SlashCommandBuilder().setName("avatar")
.setDescription("Ver avatar")
.addUserOption(o=>o.setName("usuario").setDescription("Usuário")),

new SlashCommandBuilder().setName("userinfo")
.setDescription("Informações do usuário")
.addUserOption(o=>o.setName("usuario").setDescription("Usuário")),

new SlashCommandBuilder().setName("serverinfo")
.setDescription("Informações do servidor"),

new SlashCommandBuilder().setName("embed")
.setDescription("Enviar embed")
.addStringOption(o=>o.setName("titulo").setDescription("Título").setRequired(true))
.addStringOption(o=>o.setName("descricao").setDescription("Descrição").setRequired(true))

].map(c=>c.toJSON())

const rest = new REST({version:"10"}).setToken(TOKEN)

client.once("ready", async () => {

console.log(`Bot online como ${client.user.tag}`)

// 🔥 comandos instantâneos em TODOS servidores
client.guilds.cache.forEach(async (guild) => {
await rest.put(
Routes.applicationGuildCommands(CLIENT_ID, guild.id),
{body:commands}
)
})

})

client.on("guildCreate", async (guild) => {
await rest.put(
Routes.applicationGuildCommands(CLIENT_ID, guild.id),
{body:commands}
)
})

client.on("interactionCreate", async interaction => {

if(interaction.isChatInputCommand()){

if(interaction.commandName === "help"){
return interaction.reply({
embeds:[new EmbedBuilder().setTitle("Comandos").setDescription(`
/ticket
/painel-ticket
/limpar
/enviarmensagem
/avatar
/userinfo
/serverinfo
/embed
`)]
})
}

if(interaction.commandName === "painel-ticket"){

const embed = new EmbedBuilder()
.setTitle("Painel de Configuração")

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

return interaction.reply({
embeds:[embed],
components:[new ActionRowBuilder().addComponents(menu)]
})
}

if(interaction.commandName === "limpar"){
const q = interaction.options.getInteger("quantidade")
await interaction.channel.bulkDelete(q)
return interaction.reply({content:`${q} apagadas`,ephemeral:true})
}

if(interaction.commandName === "enviarmensagem"){
const msg = interaction.options.getString("mensagem")
await interaction.channel.send(msg)
return interaction.reply({content:"Enviado",ephemeral:true})
}

if(interaction.commandName === "avatar"){
const user = interaction.options.getUser("usuario") || interaction.user
return interaction.reply({
embeds:[new EmbedBuilder().setImage(user.displayAvatarURL({dynamic:true,size:1024}))]
})
}

if(interaction.commandName === "userinfo"){
const user = interaction.options.getUser("usuario") || interaction.user
const member = interaction.guild.members.cache.get(user.id)

return interaction.reply({
embeds:[new EmbedBuilder()
.setTitle(user.username)
.addFields(
{name:"ID",value:user.id},
{name:"Criado",value:`<t:${Math.floor(user.createdTimestamp/1000)}:R>`},
{name:"Entrou",value:`<t:${Math.floor(member.joinedTimestamp/1000)}:R>`}
)]
})
}

if(interaction.commandName === "serverinfo"){
return interaction.reply({
embeds:[new EmbedBuilder()
.setTitle(interaction.guild.name)
.setDescription(`Membros: ${interaction.guild.memberCount}`)]
})
}

if(interaction.commandName === "embed"){
const t = interaction.options.getString("titulo")
const d = interaction.options.getString("descricao")

return interaction.reply({
embeds:[new EmbedBuilder().setTitle(t).setDescription(d).setImage(ticketConfig.imagem)]
})
}

}

// 🔥 MODAL CONFIG
if(interaction.isButton()){

if(interaction.customId === "config_desc"){
const modal = new ModalBuilder()
.setCustomId("desc")
.setTitle("Descrição")

modal.addComponents(
new ActionRowBuilder().addComponents(
new TextInputBuilder()
.setCustomId("d")
.setLabel("Nova descrição")
.setStyle(TextInputStyle.Paragraph)
))

return interaction.showModal(modal)
}

if(interaction.customId === "config_img"){
const modal = new ModalBuilder()
.setCustomId("img")
.setTitle("Imagem")

modal.addComponents(
new ActionRowBuilder().addComponents(
new TextInputBuilder()
.setCustomId("i")
.setLabel("URL")
.setStyle(TextInputStyle.Short)
))

return interaction.showModal(modal)
}

}

if(interaction.isModalSubmit()){
if(interaction.customId === "desc"){
ticketConfig.descricao = interaction.fields.getTextInputValue("d")
return interaction.reply({content:"Atualizado",ephemeral:true})
}

if(interaction.customId === "img"){
ticketConfig.imagem = interaction.fields.getTextInputValue("i")
return interaction.reply({content:"Atualizado",ephemeral:true})
}
}

// 🔥 CRIAR TICKET (COM VÁRIOS CARGOS)
if(interaction.isStringSelectMenu()){

if(interaction.customId === "ticket_menu"){

ticketCount++

const categoria = interaction.guild.channels.cache.find(c=>c.name==="╭─ 🛎️・ATENDIMENTO")

const staffRoles = interaction.guild.roles.cache.filter(r =>
STAFF_ROLES.includes(r.name)
)

const overwrites = [
{ id:interaction.guild.id, deny:[PermissionsBitField.Flags.ViewChannel] },
{ id:interaction.user.id, allow:[PermissionsBitField.Flags.ViewChannel] }
]

staffRoles.forEach(role=>{
overwrites.push({
id: role.id,
allow: [PermissionsBitField.Flags.ViewChannel]
})
})

const canal = await interaction.guild.channels.create({
name:`ticket-${ticketCount}`,
type:ChannelType.GuildText,
parent:categoria ? categoria.id : null,
permissionOverwrites: overwrites
})

const row = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("fechar").setLabel("🚫 Fechar").setStyle(ButtonStyle.Danger),
new ButtonBuilder().setCustomId("notificar").setLabel("👤 Notificar").setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId("assumir").setLabel("✅ Assumir").setStyle(ButtonStyle.Success)
)

await canal.send({content:`${interaction.user}`,components:[row]})

return interaction.reply({content:`Criado: ${canal}`,ephemeral:true})
}

}

// 🔥 BOTÕES
if(interaction.isButton()){

if(interaction.customId==="fechar"){
return interaction.channel.delete()
}

if(interaction.customId==="assumir"){
return interaction.reply({content:"Assumido",ephemeral:true})
}

if(interaction.customId==="notificar"){
interaction.channel.send("@here atendimento!")
return interaction.reply({content:"Notificado",ephemeral:true})
}

}

})

client.login(TOKEN)
