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

new SlashCommandBuilder()
.setName("ticket")
.setDescription("Abrir painel de ticket"),

new SlashCommandBuilder()
.setName("modpainel")
.setDescription("Abrir painel de moderação"),

new SlashCommandBuilder()
.setName("help")
.setDescription("Ver comandos")

].map(c=>c.toJSON())

const rest = new REST({version:"10"}).setToken(TOKEN)

client.once("ready", async ()=>{

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

/* HELP */

client.on("interactionCreate",async interaction=>{

if(!interaction.isChatInputCommand()) return

if(interaction.commandName==="help"){

const embed=new EmbedBuilder()

.setTitle("🤖 Comandos do Bot")

.setDescription(`
/ticket → abrir atendimento
/modpainel → painel moderação
`)

interaction.reply({embeds:[embed]})

}

/* MODPAINEL */

if(interaction.commandName==="modpainel"){

if(!interaction.member.roles.cache.has(STAFF_ROLE)){

return interaction.reply({
content:"❌ Você não tem permissão",
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

/* TICKET */

if(interaction.commandName==="ticket"){

const embed=new EmbedBuilder()

.setTitle("📩 Central de Atendimento")

.setImage("https://i.supaimg.com/4094cff7-47c8-488d-8754-3d34606a8df4/8cabf436-ce4a-497a-9f69-975fbdd829ab.png")

const menu=new ActionRowBuilder().addComponents(

new StringSelectMenuBuilder()

.setCustomId("ticket_menu")

.setPlaceholder("Escolha o tipo de ticket")

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

/* MENU TICKET */

client.on("interactionCreate",async interaction=>{

if(!interaction.isStringSelectMenu()) return

if(interaction.customId==="ticket_menu"){

const user = interaction.user

const channel = await interaction.guild.channels.create({

name:`ticket-${user.username}`,

type:ChannelType.GuildText,

permissionOverwrites:[

{ id:interaction.guild.id,deny:[PermissionsBitField.Flags.ViewChannel] },

{ id:user.id,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages] },

{ id:STAFF_ROLE,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages] }

]

})

const embed=new EmbedBuilder()

.setTitle("🎫 Ticket Aberto")

.setDescription(`Suporte em breve para ${user}`)

const buttons=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("fechar_ticket")
.setLabel("Fechar Ticket")
.setStyle(ButtonStyle.Danger),

new ButtonBuilder()
.setCustomId("add_user")
.setLabel("Adicionar Usuário")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("notificar")
.setLabel("Notificar Usuário")
.setStyle(ButtonStyle.Secondary)

)

channel.send({embeds:[embed],components:[buttons]})

interaction.reply({content:`✅ Ticket criado: ${channel}`,ephemeral:true})

const log=interaction.guild.channels.cache.get(LOG_CHANNEL)

if(log){

log.send(`📩 Ticket aberto por ${user.tag}`)

}

}

})

/* BOTÕES TICKET */

client.on("interactionCreate",async interaction=>{

if(!interaction.isButton()) return

if(interaction.customId==="fechar_ticket"){

interaction.channel.delete()

}

if(interaction.customId==="add_user"){

const menu = new ActionRowBuilder().addComponents(

new UserSelectMenuBuilder()

.setCustomId("select_user")

.setPlaceholder("Escolha o usuário")

)

interaction.reply({components:[menu],ephemeral:true})

}

if(interaction.customId==="notificar"){

const user = interaction.channel.permissionOverwrites.cache
.find(p => p.type === 1 && p.allow.has("ViewChannel"))

if(user){

const target = await client.users.fetch(user.id)

target.send("📩 Seu ticket recebeu resposta da equipe.")

interaction.reply({content:"Usuário notificado!",ephemeral:true})

}

}

})

/* ADICIONAR USUÁRIO */

client.on("interactionCreate",async interaction=>{

if(!interaction.isUserSelectMenu()) return

const user = interaction.values[0]

await interaction.channel.permissionOverwrites.edit(user,{
ViewChannel:true,
SendMessages:true
})

interaction.reply({content:"Usuário adicionado ao ticket!",ephemeral:true})

})

/* BOAS VINDAS */

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
