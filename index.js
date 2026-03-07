const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
StringSelectMenuBuilder,
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

const commands=[

new SlashCommandBuilder().setName("help").setDescription("Ver comandos"),

new SlashCommandBuilder().setName("ticket").setDescription("Abrir ticket"),

new SlashCommandBuilder().setName("modpainel").setDescription("Abrir painel staff")

].map(c=>c.toJSON())

const rest=new REST({version:"10"}).setToken(TOKEN)

client.once("ready",async()=>{

console.log(`🤖 Bot online ${client.user.tag}`)

await rest.put(
Routes.applicationCommands(CLIENT_ID),
{body:commands}
)

client.guilds.cache.forEach(async guild=>{
const guildInvites = await guild.invites.fetch()
invites.set(guild.id,guildInvites)
})

})

client.on("interactionCreate",async interaction=>{

if(!interaction.isChatInputCommand()) return

if(interaction.commandName==="help"){

const embed=new EmbedBuilder()

.setTitle("🤖 Comandos")

.setDescription(`
/ticket → abrir atendimento
/modpainel → painel moderação
`)

interaction.reply({embeds:[embed]})

}

if(interaction.commandName==="modpainel"){

if(!interaction.member.roles.cache.has(STAFF_ROLE)){

return interaction.reply({
content:"❌ Sem permissão",
ephemeral:true
})

}

const embed=new EmbedBuilder()

.setTitle("🛡️ Painel de Moderação")

.setDescription("Escolha uma ação")

const row=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("ban")
.setLabel("Ban")
.setStyle(ButtonStyle.Danger),

new ButtonBuilder()
.setCustomId("kick")
.setLabel("Kick")
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("mute")
.setLabel("Mute")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("limpar")
.setLabel("Limpar")
.setStyle(ButtonStyle.Success)

)

interaction.reply({embeds:[embed],components:[row]})

}

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

client.on("interactionCreate",async interaction=>{

if(interaction.isButton()){

if(!interaction.member.roles.cache.has(STAFF_ROLE)){

return interaction.reply({
content:"❌ Sem permissão",
ephemeral:true
})

}

if(interaction.customId==="limpar"){

await interaction.channel.bulkDelete(10)

interaction.reply({content:"🧹 10 mensagens apagadas",ephemeral:true})

}

}

if(interaction.isStringSelectMenu()){

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

channel.send(`🎫 Ticket aberto por ${user}`)

interaction.reply({content:`✅ Ticket criado: ${channel}`,ephemeral:true})

const log=interaction.guild.channels.cache.get(LOG_CHANNEL)

if(log){

log.send(`📩 Ticket aberto por ${user.tag}`)

}

}

}

})

client.on("guildMemberAdd",async member=>{

const channel=member.guild.channels.cache.get(WELCOME_CHANNEL)

if(!channel) return

const newInvites = await member.guild.invites.fetch()
const oldInvites = invites.get(member.guild.id)

const invite = newInvites.find(i => oldInvites.get(i.code)?.uses < i.uses)

let inviter="Desconhecido"
let total=0

if(invite){

inviter = `<@${invite.inviter.id}>`
total = invite.uses

}

invites.set(member.guild.id,newInvites)

const embed=new EmbedBuilder()

.setTitle(`👋 Seja bem vindo ${member.user.username}`)

.setImage(member.user.displayAvatarURL({size:1024,dynamic:true}))

channel.send({embeds:[embed]})

channel.send(`${member} você foi convidado por ${inviter} e agora ele tem **${total} invites**`)

})

client.login(TOKEN)
