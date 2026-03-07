const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
StringSelectMenuBuilder,
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
.setName("help")
.setDescription("Ver comandos"),

new SlashCommandBuilder()
.setName("avatar")
.setDescription("Ver avatar")
.addUserOption(o=>o.setName("usuario").setDescription("Usuário")),

new SlashCommandBuilder()
.setName("ticket")
.setDescription("Abrir painel de atendimento"),

new SlashCommandBuilder()
.setName("enviarmensagem")
.setDescription("Enviar mensagem")
.addStringOption(o=>o.setName("mensagem").setDescription("Mensagem").setRequired(true)),

new SlashCommandBuilder()
.setName("limpar")
.setDescription("Apagar mensagens")
.addIntegerOption(o=>o.setName("quantidade").setDescription("Quantidade").setRequired(true)),

new SlashCommandBuilder()
.setName("ban")
.setDescription("Banir usuário")
.addUserOption(o=>o.setName("usuario").setDescription("Usuário").setRequired(true)),

new SlashCommandBuilder()
.setName("kick")
.setDescription("Expulsar usuário")
.addUserOption(o=>o.setName("usuario").setDescription("Usuário").setRequired(true)),

new SlashCommandBuilder()
.setName("mute")
.setDescription("Mutar usuário")
.addUserOption(o=>o.setName("usuario").setDescription("Usuário").setRequired(true)),

new SlashCommandBuilder()
.setName("unmute")
.setDescription("Desmutar usuário")
.addUserOption(o=>o.setName("usuario").setDescription("Usuário").setRequired(true)),

new SlashCommandBuilder()
.setName("abraçar")
.setDescription("Abraçar alguém")
.addUserOption(o=>o.setName("usuario").setDescription("Usuário").setRequired(true)),

new SlashCommandBuilder()
.setName("beijar")
.setDescription("Beijar alguém")
.addUserOption(o=>o.setName("usuario").setDescription("Usuário").setRequired(true)),

new SlashCommandBuilder()
.setName("cafune")
.setDescription("Fazer cafuné")
.addUserOption(o=>o.setName("usuario").setDescription("Usuário").setRequired(true)),

new SlashCommandBuilder()
.setName("slap")
.setDescription("Dar tapa")
.addUserOption(o=>o.setName("usuario").setDescription("Usuário").setRequired(true))

].map(c=>c.toJSON())

const rest=new REST({version:"10"}).setToken(TOKEN)

client.once("ready",async()=>{

console.log(`🤖 Bot online: ${client.user.tag}`)

await rest.put(
Routes.applicationGuildCommands(CLIENT_ID,GUILD_ID),
{body:commands}
)

await rest.put(
Routes.applicationCommands(CLIENT_ID),
{body:commands}
)

})

/* COMANDOS */

client.on("interactionCreate",async interaction=>{

if(!interaction.isChatInputCommand()) return

/* HELP */

if(interaction.commandName==="help"){

const embed=new EmbedBuilder()

.setTitle("🤖 Painel de Comandos")

.addFields(

{name:"📩 Ticket",value:"`/ticket` abrir atendimento"},

{name:"🛡️ Moderação",value:"`/ban` `/kick` `/mute` `/unmute` `/limpar`"},

{name:"💬 Utilidades",value:"`/avatar` `/enviarmensagem`"},

{name:"🎭 Interação",value:"`/abraçar` `/beijar` `/cafune` `/slap`"}

)

.setColor("Blue")

interaction.reply({embeds:[embed]})

}

/* AVATAR */

if(interaction.commandName==="avatar"){

const user=interaction.options.getUser("usuario")||interaction.user

const embed=new EmbedBuilder()

.setTitle(`Avatar de ${user.username}`)

.setImage(user.displayAvatarURL({size:1024,dynamic:true}))

interaction.reply({embeds:[embed]})

}

/* ENVIAR MENSAGEM */

if(interaction.commandName==="enviarmensagem"){

const msg=interaction.options.getString("mensagem")

await interaction.channel.send(msg)

interaction.reply({content:"✅ Mensagem enviada",ephemeral:true})

}

/* MODERAÇÃO */

if(["ban","kick","mute","unmute","limpar"].includes(interaction.commandName)){

if(!interaction.member.roles.cache.has(STAFF_ROLE)){

return interaction.reply({content:"❌ Sem permissão",ephemeral:true})

}

}

/* LIMPAR */

if(interaction.commandName==="limpar"){

const q=interaction.options.getInteger("quantidade")

await interaction.channel.bulkDelete(q)

interaction.reply({content:`🧹 ${q} mensagens apagadas`,ephemeral:true})

}

/* BAN */

if(interaction.commandName==="ban"){

const user=interaction.options.getUser("usuario")

const member=await interaction.guild.members.fetch(user.id)

await member.ban()

interaction.reply(`🔨 ${user.tag} foi banido.`)

}

/* KICK */

if(interaction.commandName==="kick"){

const user=interaction.options.getUser("usuario")

const member=await interaction.guild.members.fetch(user.id)

await member.kick()

interaction.reply(`👢 ${user.tag} foi expulso.`)

}

/* MUTE */

if(interaction.commandName==="mute"){

const user=interaction.options.getUser("usuario")

const member=await interaction.guild.members.fetch(user.id)

await member.timeout(10*60*1000)

interaction.reply(`🔇 ${user.tag} mutado por 10 minutos.`)

}

/* UNMUTE */

if(interaction.commandName==="unmute"){

const user=interaction.options.getUser("usuario")

const member=await interaction.guild.members.fetch(user.id)

await member.timeout(null)

interaction.reply(`🔊 ${user.tag} desmutado.`)

}

/* INTERAÇÃO */

const gifs={
abraçar:"https://media.tenor.com/6e0QqY8v0O4AAAAC/anime-hug.gif",
beijar:"https://media.tenor.com/5L8nT3GkH8YAAAAC/anime-kiss.gif",
cafune:"https://media.tenor.com/5kYJ6p4pF5QAAAAC/anime-pat.gif",
slap:"https://media.tenor.com/OjK2F2Kq9JQAAAAC/anime-slap.gif"
}

if(gifs[interaction.commandName]){

const user=interaction.options.getUser("usuario")

const embed=new EmbedBuilder()

.setDescription(`${interaction.user} ${interaction.commandName} ${user}`)

.setImage(gifs[interaction.commandName])

interaction.reply({embeds:[embed]})

}

/* TICKET */

if(interaction.commandName==="ticket"){

const embed=new EmbedBuilder()

.setTitle("📩 Central de Atendimento")

.setDescription("Selecione o tipo de ticket")

.setImage("https://i.supaimg.com/4094cff7-47c8-488d-8754-3d34606a8df4/8cabf436-ce4a-497a-9f69-975fbdd829ab.png")

const menu=new ActionRowBuilder().addComponents(

new StringSelectMenuBuilder()

.setCustomId("menu_ticket")

.setPlaceholder("Escolha uma opção")

.addOptions([

{label:"⚒️ SUPORTE",value:"suporte"},

{label:"💸 REEMBOLSO",value:"reembolso"},

{label:"👤 VAGAS",value:"vagas"},

{label:"💰 PREMIAÇÕES",value:"premio"}

])

)

interaction.reply({embeds:[embed],components:[menu]})

}

})

/* CRIAR TICKET */

client.on("interactionCreate",async interaction=>{

if(!interaction.isStringSelectMenu()) return

if(interaction.customId==="menu_ticket"){

const user=interaction.user

const canal=await interaction.guild.channels.create({

name:`ticket-${user.username}`,

type:ChannelType.GuildText,

permissionOverwrites:[

{ id:interaction.guild.id,deny:[PermissionsBitField.Flags.ViewChannel] },

{ id:user.id,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages] },

{ id:STAFF_ROLE,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages] }

]

})

canal.send(`🎫 Ticket aberto por ${user}`)

interaction.reply({content:`✅ Ticket criado: ${canal}`,ephemeral:true})

const log=interaction.guild.channels.cache.get(LOG_CHANNEL)

if(log) log.send(`📩 Ticket aberto por ${user.tag}`)

}

})

client.login(TOKEN)
