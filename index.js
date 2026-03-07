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

const invites = new Map()

/* COMANDOS */

const commands=[

new SlashCommandBuilder().setName("help").setDescription("Ver comandos"),

new SlashCommandBuilder().setName("ticket").setDescription("Abrir ticket"),

new SlashCommandBuilder().setName("modpainel").setDescription("Painel moderação"),

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
.setName("abraçar")
.setDescription("Abraçar usuário")
.addUserOption(o=>o.setName("usuario").setDescription("Usuário").setRequired(true)),

new SlashCommandBuilder()
.setName("beijar")
.setDescription("Beijar usuário")
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

console.log(`Bot online ${client.user.tag}`)

await rest.put(
Routes.applicationCommands(CLIENT_ID),
{body:commands}
)

client.guilds.cache.forEach(async guild=>{
const guildInvites = await guild.invites.fetch()
invites.set(guild.id,guildInvites)
})

})

/* INTERAÇÕES */

client.on("interactionCreate",async interaction=>{

if(!interaction.isChatInputCommand()) return

/* HELP */

if(interaction.commandName==="help"){

const embed=new EmbedBuilder()

.setTitle("🤖 Comandos")

.setDescription(`
/ticket
/modpainel
/enviarmensagem
/limpar
/avatar
/abraçar
/beijar
/cafune
/slap
`)

interaction.reply({embeds:[embed]})

}

/* ENVIAR MSG */

if(interaction.commandName==="enviarmensagem"){

const msg=interaction.options.getString("mensagem")

await interaction.channel.send(msg)

interaction.reply({content:"✅ Mensagem enviada",ephemeral:true})

}

/* LIMPAR */

if(interaction.commandName==="limpar"){

if(!interaction.member.roles.cache.has(STAFF_ROLE)){

return interaction.reply({content:"❌ Sem permissão",ephemeral:true})

}

const q=interaction.options.getInteger("quantidade")

await interaction.channel.bulkDelete(q)

interaction.reply({content:`🧹 ${q} mensagens apagadas`,ephemeral:true})

}

/* AVATAR */

if(interaction.commandName==="avatar"){

const user=interaction.options.getUser("usuario") || interaction.user

const embed=new EmbedBuilder()

.setTitle(`Avatar de ${user.username}`)

.setImage(user.displayAvatarURL({size:1024,dynamic:true}))

interaction.reply({embeds:[embed]})

}

/* INTERAÇÃO GIF */

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

/* MODPAINEL */

if(interaction.commandName==="modpainel"){

if(!interaction.member.roles.cache.has(STAFF_ROLE)){

return interaction.reply({content:"❌ Sem permissão",ephemeral:true})

}

const embed=new EmbedBuilder()

.setTitle("🛡️ Painel Moderação")

.setDescription("Escolha ação")

const row=new ActionRowBuilder().addComponents(

new ButtonBuilder().setCustomId("limpar10").setLabel("Limpar 10").setStyle(ButtonStyle.Danger)

)

interaction.reply({embeds:[embed],components:[row]})

}

/* TICKET */

if(interaction.commandName==="ticket"){

const embed=new EmbedBuilder()

.setTitle("📩 Central de Atendimento")

.setImage("https://i.supaimg.com/4094cff7-47c8-488d-8754-3d34606a8df4/8cabf436-ce4a-497a-9f69-975fbdd829ab.png")

const menu=new ActionRowBuilder().addComponents(

new StringSelectMenuBuilder()

.setCustomId("ticket_menu")

.setPlaceholder("Escolha")

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

/* BOTÕES */

client.on("interactionCreate",async interaction=>{

if(interaction.isButton()){

if(interaction.customId==="limpar10"){

await interaction.channel.bulkDelete(10)

interaction.reply({content:"🧹 10 mensagens apagadas",ephemeral:true})

}

if(interaction.customId==="fechar_ticket"){

interaction.channel.delete()

}

}

})

/* MENU TICKET */

client.on("interactionCreate",async interaction=>{

if(!interaction.isStringSelectMenu()) return

if(interaction.customId==="ticket_menu"){

const user=interaction.user

const channel=await interaction.guild.channels.create({

name:`ticket-${user.username}`,

type:ChannelType.GuildText,

permissionOverwrites:[

{ id:interaction.guild.id,deny:[PermissionsBitField.Flags.ViewChannel] },

{ id:user.id,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages] },

{ id:STAFF_ROLE,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages] }

]

})

const buttons=new ActionRowBuilder().addComponents(

new ButtonBuilder().setCustomId("fechar_ticket").setLabel("Fechar Ticket").setStyle(ButtonStyle.Danger)

)

channel.send({content:`🎫 Ticket aberto por ${user}`,components:[buttons]})

interaction.reply({content:`Ticket criado: ${channel}`,ephemeral:true})

const log=interaction.guild.channels.cache.get(LOG_CHANNEL)

if(log) log.send(`Ticket aberto por ${user.tag}`)

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
