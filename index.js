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
const LOG_CHANNEL = "1473752382541402162"

const client = new Client({
intents:[
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.MessageContent
]
})

/* COMANDOS */

const commands=[

new SlashCommandBuilder()
.setName("ticket")
.setDescription("Abrir painel de ticket"),

new SlashCommandBuilder()
.setName("enviarmensagem")
.setDescription("Enviar mensagem pelo bot")
.addStringOption(o=>
o.setName("mensagem")
.setDescription("Mensagem")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("limpar")
.setDescription("Apagar mensagens")
.addIntegerOption(o=>
o.setName("quantidade")
.setDescription("Quantidade")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("abraçar")
.setDescription("Abraçar alguém")
.addUserOption(o=>
o.setName("usuario")
.setDescription("Usuário")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("beijar")
.setDescription("Beijar alguém")
.addUserOption(o=>
o.setName("usuario")
.setDescription("Usuário")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("cafune")
.setDescription("Fazer cafuné")
.addUserOption(o=>
o.setName("usuario")
.setDescription("Usuário")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("slap")
.setDescription("Dar um tapa")
.addUserOption(o=>
o.setName("usuario")
.setDescription("Usuário")
.setRequired(true)
)

].map(c=>c.toJSON())

const rest=new REST({version:"10"}).setToken(TOKEN)

/* REGISTRAR COMANDOS */

client.once("ready",async()=>{

console.log(`🤖 Bot online: ${client.user.tag}`)

try{

/* SERVIDOR PRINCIPAL (RÁPIDO) */

await rest.put(
Routes.applicationGuildCommands(CLIENT_ID,GUILD_ID),
{body:commands}
)

/* GLOBAL (OUTROS SERVIDORES) */

await rest.put(
Routes.applicationCommands(CLIENT_ID),
{body:commands}
)

console.log("✅ Comandos registrados com sucesso")

}catch(err){

console.log(err)

}

})

/* COMANDOS */

client.on("interactionCreate",async interaction=>{

if(!interaction.isChatInputCommand()) return

/* ENVIAR MENSAGEM */

if(interaction.commandName==="enviarmensagem"){

const msg=interaction.options.getString("mensagem")

await interaction.channel.send(msg)

interaction.reply({content:"✅ Mensagem enviada",ephemeral:true})

}

/* LIMPAR */

if(interaction.commandName==="limpar"){

const q=interaction.options.getInteger("quantidade")

await interaction.channel.bulkDelete(q)

interaction.reply({content:`🧹 ${q} mensagens apagadas`,ephemeral:true})

}

/* ABRAÇAR */

if(interaction.commandName==="abraçar"){

const user=interaction.options.getUser("usuario")

const embed=new EmbedBuilder()
.setDescription(`🤗 ${interaction.user} abraçou ${user}!`)
.setImage("https://media.tenor.com/6e0QqY8v0O4AAAAC/anime-hug.gif")

interaction.reply({embeds:[embed]})

}

/* BEIJAR */

if(interaction.commandName==="beijar"){

const user=interaction.options.getUser("usuario")

const embed=new EmbedBuilder()
.setDescription(`💋 ${interaction.user} beijou ${user}!`)
.setImage("https://media.tenor.com/5L8nT3GkH8YAAAAC/anime-kiss.gif")

interaction.reply({embeds:[embed]})

}

/* CAFUNE */

if(interaction.commandName==="cafune"){

const user=interaction.options.getUser("usuario")

const embed=new EmbedBuilder()
.setDescription(`🫳 ${interaction.user} fez cafuné em ${user}!`)
.setImage("https://media.tenor.com/5kYJ6p4pF5QAAAAC/anime-pat.gif")

interaction.reply({embeds:[embed]})

}

/* SLAP */

if(interaction.commandName==="slap"){

const user=interaction.options.getUser("usuario")

const embed=new EmbedBuilder()
.setDescription(`👋 ${interaction.user} deu um tapa em ${user}!`)
.setImage("https://media.tenor.com/OjK2F2Kq9JQAAAAC/anime-slap.gif")

interaction.reply({embeds:[embed]})

}

})

client.login(TOKEN)
