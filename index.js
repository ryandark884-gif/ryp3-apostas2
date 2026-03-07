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

const STAFF_ROLE = "1463198259186106429"
const LOG_CHANNEL = "1473752382541402162"
const WELCOME_CHANNEL = "1473752318800433313"

const client = new Client({
intents:[
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]
})

/* COMANDOS */

const commands=[

new SlashCommandBuilder().setName("help").setDescription("Ver comandos"),

new SlashCommandBuilder().setName("ticket").setDescription("Abrir ticket"),

new SlashCommandBuilder()
.setName("enviarmensagem")
.setDescription("Enviar mensagem")
.addStringOption(o=>o.setName("mensagem").setDescription("Mensagem").setRequired(true)),

new SlashCommandBuilder()
.setName("limpar")
.setDescription("Limpar mensagens")
.addIntegerOption(o=>o.setName("quantidade").setDescription("Quantidade").setRequired(true)),

new SlashCommandBuilder()
.setName("avatar")
.setDescription("Ver avatar")
.addUserOption(o=>o.setName("usuario").setDescription("Usuário")),

new SlashCommandBuilder()
.setName("cafune")
.setDescription("Fazer cafuné")
.addUserOption(o=>o.setName("usuario").setDescription("Usuário").setRequired(true)),

new SlashCommandBuilder()
.setName("modpainel")
.setDescription("Painel de moderação")

].map(c=>c.toJSON())

const rest=new REST({version:"10"}).setToken(TOKEN)

client.once("ready",async()=>{

console.log(`Bot online ${client.user.tag}`)

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

.setTitle("🤖 Comandos")

.setDescription(`
/ticket
/enviarmensagem
/limpar
/avatar
/cafune
/modpainel
`)

interaction.reply({embeds:[embed]})

}

/* ENVIAR MSG */

if(interaction.commandName==="enviarmensagem"){

const msg=interaction.options.getString("mensagem")

await interaction.channel.send(msg)

interaction.reply({content:"Mensagem enviada!",ephemeral:true})

}

/* LIMPAR */

if(interaction.commandName==="limpar"){

const q=interaction.options.getInteger("quantidade")

await interaction.channel.bulkDelete(q)

interaction.reply({content:`${q} mensagens apagadas`,ephemeral:true})

}

/* AVATAR */

if(interaction.commandName==="avatar"){

const user=interaction.options.getUser("usuario") || interaction.user

const embed=new EmbedBuilder()

.setTitle(`Avatar de ${user.username}`)

.setImage(user.displayAvatarURL({size:1024,dynamic:true}))

interaction.reply({embeds:[embed]})

}

/* CAFUNÉ */

if(interaction.commandName==="cafune"){

const user=interaction.options.getUser("usuario")

const embed=new EmbedBuilder()

.setDescription(`${interaction.user} fez cafuné em ${user}`)

.setImage("https://media.tenor.com/5kYJ6p4pF5QAAAAC/anime-pat.gif")

interaction.reply({embeds:[embed]})

}

/* MODPAINEL */

if(interaction.commandName==="modpainel"){

if(!interaction.member.roles.cache.has(STAFF_ROLE)){

return interaction.reply({content:"❌ Sem permissão",ephemeral:true})

}

const embed=new EmbedBuilder()

.setTitle("🛡️ Painel de Moderação")

.setDescription("Escolha uma ação")

const row=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("ban_user")
.setLabel("🔨 Ban")
.setStyle(ButtonStyle.Danger),

new ButtonBuilder()
.setCustomId("mute_user")
.setLabel("🔇 Mute")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("unmute_user")
.setLabel("🔊 Unmute")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("limpar10")
.setLabel("🧹 Limpar 10")
.setStyle(ButtonStyle.Secondary)

)

interaction.reply({embeds:[embed],components:[row]})

}

})

/* BOTÕES MOD */

client.on("interactionCreate",async interaction=>{

if(!interaction.isButton()) return

if(interaction.customId==="limpar10"){

await interaction.channel.bulkDelete(10)

interaction.reply({content:"🧹 10 mensagens apagadas",ephemeral:true})

}

})

/* BOAS VINDAS */

client.on("guildMemberAdd",async member=>{

const channel=member.guild.channels.cache.get(WELCOME_CHANNEL)

if(!channel) return

const embed=new EmbedBuilder()

.setTitle(`👋 Seja bem vindo ${member.user.username}`)

.setImage(member.user.displayAvatarURL({size:1024,dynamic:true}))

channel.send({embeds:[embed]})

})

client.login(TOKEN)
