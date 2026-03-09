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
SlashCommandBuilder,
REST,
Routes,
ChannelType
} = require("discord.js")

const TOKEN = process.env.TOKEN
const CLIENT_ID = process.env.CLIENT_ID
const GUILD_ID = process.env.GUILD_ID

const STAFF_ROLE = "1463198259186106429"
const WELCOME_CHANNEL = "1473752318800433313"

let ticketCount = 0

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

new SlashCommandBuilder()
.setName("enviarmensagem")
.setDescription("Enviar mensagem pelo bot")
.addStringOption(o=>o.setName("mensagem").setDescription("Mensagem").setRequired(true)),

new SlashCommandBuilder()
.setName("limpar")
.setDescription("Apagar mensagens")
.addIntegerOption(o=>o.setName("quantidade").setDescription("Quantidade").setRequired(true)),

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
.setDescription("Criar embed personalizado")
.addStringOption(o=>o.setName("titulo").setDescription("Título").setRequired(true))
.addStringOption(o=>o.setName("descricao").setDescription("Descrição").setRequired(true))

].map(c=>c.toJSON())

const rest = new REST({version:"10"}).setToken(TOKEN)

client.once("ready",async()=>{

console.log(`✅ Bot online como ${client.user.tag}`)

await rest.put(
Routes.applicationGuildCommands(CLIENT_ID,GUILD_ID),
{body:commands}
)

})

client.on("interactionCreate",async interaction=>{

if(interaction.isChatInputCommand()){

if(interaction.commandName==="help"){

const embed=new EmbedBuilder()
.setTitle("🤖 Comandos do Bot")
.setDescription(`
/ticket
/enviarmensagem
/limpar
/avatar
/userinfo
/serverinfo
/embed
`)

interaction.reply({embeds:[embed]})

}

if(interaction.commandName==="embed"){

const titulo=interaction.options.getString("titulo")
const descricao=interaction.options.getString("descricao")

const embed=new EmbedBuilder()
.setTitle(titulo)
.setDescription(descricao)
.setColor("Blue")
.setThumbnail("https://files.catbox.moe/8z9c5c.jpg")
.setImage("https://files.catbox.moe/b1k9l2.jpg")

interaction.reply({embeds:[embed]})

}

if(interaction.commandName==="enviarmensagem"){

const msg=interaction.options.getString("mensagem")

await interaction.channel.send(msg)

interaction.reply({content:"✅ Mensagem enviada",ephemeral:true})

}

if(interaction.commandName==="limpar"){

const q=interaction.options.getInteger("quantidade")

await interaction.channel.bulkDelete(q)

interaction.reply({content:`🧹 ${q} mensagens apagadas`,ephemeral:true})

}

if(interaction.commandName==="avatar"){

const user=interaction.options.getUser("usuario")||interaction.user

const embed=new EmbedBuilder()
.setTitle(`Avatar de ${user.username}`)
.setImage(user.displayAvatarURL({size:1024,dynamic:true}))

interaction.reply({embeds:[embed]})

}

if(interaction.commandName==="userinfo"){

const user=interaction.options.getUser("usuario")||interaction.user
const member=interaction.guild.members.cache.get(user.id)

const embed=new EmbedBuilder()
.setTitle(`👤 ${user.username}`)
.setThumbnail(user.displayAvatarURL({dynamic:true}))
.addFields(
{name:"ID",value:user.id},
{name:"Entrou no servidor",value:`<t:${parseInt(member.joinedTimestamp/1000)}:R>`},
{name:"Conta criada
