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
.addUserOption(o=>o.setName("usuario").setDescription("Usuário").setRequired(true)),

new SlashCommandBuilder()
.setName("modpainel")
.setDescription("Painel moderação")

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
/abraçar
/beijar
/cafune
/slap
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

/* INTERAÇÕES */

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

const embed=new EmbedBuilder()

.setTitle("🛡️ Painel Moderação")

const row=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("limpar10")
.setLabel("🧹 Limpar 10")
.setStyle(ButtonStyle.Danger)

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

/* CRIAR TICKET */

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

const embed=new EmbedBuilder()

.setTitle("🎫 Ticket aberto")

.setDescription(`Aguarde atendimento ${user}`)

const buttons=new ActionRowBuilder().addComponents(

new ButtonBuilder().setCustomId("assumir").setLabel("🛠 Assumir Ticket").setStyle(ButtonStyle.Success),

new ButtonBuilder().setCustomId("add_user").setLabel("👤 Adicionar Usuário").setStyle(ButtonStyle.Primary),

new ButtonBuilder().setCustomId("notify").setLabel("📢 Notificar Usuário").setStyle(ButtonStyle.Secondary),

new ButtonBuilder().setCustomId("fechar").setLabel("🚫 Fechar Ticket").setStyle(ButtonStyle.Danger)

)

channel.send({embeds:[embed],components:[buttons]})

interaction.reply({content:`Ticket criado: ${channel}`,ephemeral:true})

}

})

/* BOTÕES */

client.on("interactionCreate",async interaction=>{

if(!interaction.isButton()) return

if(interaction.customId==="assumir"){

interaction.channel.send(`🛠 Ticket assumido por ${interaction.user}`)

}

if(interaction.customId==="fechar"){

interaction.channel.delete()

}

if(interaction.customId==="notify"){

const user = interaction.channel.permissionOverwrites.cache
.find(p=>p.type===1)

if(user){

const target = await client.users.fetch(user.id)

target.send("📩 Seu ticket recebeu resposta da equipe.")

interaction.reply({content:"Usuário notificado!",ephemeral:true})

}

}

if(interaction.customId==="add_user"){

const menu=new ActionRowBuilder().addComponents(

new UserSelectMenuBuilder()
.setCustomId("select_user")
.setPlaceholder("Escolha usuário")

)

interaction.reply({components:[menu],ephemeral:true})

}

})

/* ADICIONAR USUÁRIO */

client.on("interactionCreate",async interaction=>{

if(!interaction.isUserSelectMenu()) return

const user=interaction.values[0]

await interaction.channel.permissionOverwrites.edit(user,{
ViewChannel:true,
SendMessages:true
})

interaction.reply({content:"Usuário adicionado!",ephemeral:true})

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
