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
.setDescription("Enviar painel de tickets"),

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

;(async()=>{

await rest.put(
Routes.applicationGuildCommands(CLIENT_ID,GUILD_ID),
{body:commands}
)

await rest.put(
Routes.applicationCommands(CLIENT_ID),
{body:commands}
)

console.log("✅ Comandos registrados")

})()

client.once("ready",()=>{

console.log(`🤖 Bot online: ${client.user.tag}`)

})

/* COMANDOS */

client.on("interactionCreate",async interaction=>{

if(!interaction.isChatInputCommand()) return

/* TICKET */

if(interaction.commandName==="ticket"){

const embed=new EmbedBuilder()

.setTitle("📩 Central de Atendimento")

.setDescription("Selecione abaixo o tipo de atendimento.")

.setColor("Blue")

.setImage("https://i.supaimg.com/4094cff7-47c8-488d-8754-3d34606a8df4/8cabf436-ce4a-497a-9f69-975fbdd829ab.png")

const menu=new ActionRowBuilder().addComponents(

new StringSelectMenuBuilder()

.setCustomId("menu_ticket")

.setPlaceholder("Escolha uma opção")

.addOptions([

{label:"⚒️ | SUPORTE",value:"suporte"},
{label:"💸 | REEMBOLSO",value:"reembolso"},
{label:"👤 | VAGAS",value:"vagas"},
{label:"💰 | RECEBER PREMIAÇÕES",value:"premio"}

])

)

interaction.reply({embeds:[embed],components:[menu]})

}

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

.setColor("Pink")

.setImage("https://media.tenor.com/6e0QqY8v0O4AAAAC/anime-hug.gif")

interaction.reply({embeds:[embed]})

}

/* BEIJAR */

if(interaction.commandName==="beijar"){

const user=interaction.options.getUser("usuario")

const embed=new EmbedBuilder()

.setDescription(`💋 ${interaction.user} beijou ${user}!`)

.setColor("Red")

.setImage("https://media.tenor.com/5L8nT3GkH8YAAAAC/anime-kiss.gif")

interaction.reply({embeds:[embed]})

}

/* CAFUNE */

if(interaction.commandName==="cafune"){

const user=interaction.options.getUser("usuario")

const embed=new EmbedBuilder()

.setDescription(`🫳 ${interaction.user} fez cafuné em ${user}!`)

.setColor("Orange")

.setImage("https://media.tenor.com/5kYJ6p4pF5QAAAAC/anime-pat.gif")

interaction.reply({embeds:[embed]})

}

/* SLAP */

if(interaction.commandName==="slap"){

const user=interaction.options.getUser("usuario")

const embed=new EmbedBuilder()

.setDescription(`👋 ${interaction.user} deu um tapa em ${user}!`)

.setColor("Purple")

.setImage("https://media.tenor.com/OjK2F2Kq9JQAAAAC/anime-slap.gif")

interaction.reply({embeds:[embed]})

}

})

/* MENU TICKET */

client.on("interactionCreate",async interaction=>{

if(!interaction.isStringSelectMenu()) return

if(interaction.customId==="menu_ticket"){

const user=interaction.user

const canal=await interaction.guild.channels.create({

name:`ticket-${user.username}`,

topic:user.id,

type:ChannelType.GuildText,

permissionOverwrites:[

{ id:interaction.guild.id, deny:[PermissionsBitField.Flags.ViewChannel] },

{ id:user.id, allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages] },

{ id:STAFF_ROLE, allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages] }

]

})

const embed=new EmbedBuilder()

.setTitle("🎫 Ticket aberto")

.setDescription(`Usuário: ${user}\nAguarde um administrador.`)

.setColor("Green")

const buttons=new ActionRowBuilder().addComponents(

new ButtonBuilder().setCustomId("fechar_ticket").setLabel("🚫 FECHAR").setStyle(ButtonStyle.Danger),

new ButtonBuilder().setCustomId("notificar_user").setLabel("👤 NOTIFICAR").setStyle(ButtonStyle.Primary),

new ButtonBuilder().setCustomId("add_user").setLabel("➕ ADICIONAR").setStyle(ButtonStyle.Secondary)

)

canal.send({embeds:[embed],components:[buttons]})

interaction.reply({content:`✅ Ticket criado: ${canal}`,ephemeral:true})

const log=interaction.guild.channels.cache.get(LOG_CHANNEL)

if(log){

log.send(`📂 Ticket aberto por ${user}`)

}

}

})

/* BOTÕES */

client.on("interactionCreate",async interaction=>{

if(!interaction.isButton()) return

if(!interaction.member.roles.cache.has(STAFF_ROLE)){

return interaction.reply({content:"❌ Apenas STAFF pode usar.",ephemeral:true})

}

if(interaction.customId==="fechar_ticket"){

const log=interaction.guild.channels.cache.get(LOG_CHANNEL)

if(log){

log.send(`🔒 Ticket fechado por ${interaction.user}`)

}

interaction.channel.delete()

}

if(interaction.customId==="notificar_user"){

const userId=interaction.channel.topic

const membro=await interaction.guild.members.fetch(userId)

try{

await membro.send(`📩 Seu ticket no servidor ${interaction.guild.name} recebeu resposta.`)

interaction.reply({content:"✅ Usuário notificado",ephemeral:true})

}catch{

interaction.reply({content:"❌ Não consegui enviar mensagem privada",ephemeral:true})

}

}

if(interaction.customId==="add_user"){

interaction.reply({content:"⚠️ Adicione manualmente nas permissões do canal.",ephemeral:true})

}

})

client.login(TOKEN)
