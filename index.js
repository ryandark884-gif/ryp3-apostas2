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
Routes
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

new SlashCommandBuilder()
.setName("help")
.setDescription("Ver comandos"),

new SlashCommandBuilder()
.setName("ticket")
.setDescription("Abrir painel de ticket"),

new SlashCommandBuilder()
.setName("limpar")
.setDescription("Apagar mensagens")
.addIntegerOption(o=>o.setName("quantidade").setDescription("Quantidade").setRequired(true)),

new SlashCommandBuilder()
.setName("enviarmensagem")
.setDescription("Enviar mensagem pelo bot")
.addStringOption(o=>o.setName("mensagem").setDescription("Mensagem").setRequired(true)),

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
.setDescription("Enviar embed")
.addStringOption(o=>o.setName("titulo").setDescription("Título").setRequired(true))
.addStringOption(o=>o.setName("descricao").setDescription("Descrição").setRequired(true))

].map(c=>c.toJSON())

const rest = new REST({version:"10"}).setToken(TOKEN)

client.once("ready", async () => {

console.log(`Bot online como ${client.user.tag}`)

await rest.put(
Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
{body:commands}
)

})

client.on("interactionCreate", async interaction => {

if(!interaction.isChatInputCommand()) return

if(interaction.commandName === "help"){

const embed = new EmbedBuilder()
.setTitle("Comandos do bot")
.setDescription(`
/ticket
/limpar
/enviarmensagem
/avatar
/userinfo
/serverinfo
/embed
`)

interaction.reply({embeds:[embed]})

}

if(interaction.commandName === "limpar"){

const q = interaction.options.getInteger("quantidade")

await interaction.channel.bulkDelete(q)

interaction.reply({content:`${q} mensagens apagadas`,ephemeral:true})

}

if(interaction.commandName === "enviarmensagem"){

const msg = interaction.options.getString("mensagem")

await interaction.channel.send(msg)

interaction.reply({content:"Mensagem enviada",ephemeral:true})

}

if(interaction.commandName === "avatar"){

const user = interaction.options.getUser("usuario") || interaction.user

const embed = new EmbedBuilder()
.setTitle(`Avatar de ${user.username}`)
.setImage(user.displayAvatarURL({size:1024,dynamic:true}))

interaction.reply({embeds:[embed]})

}

if(interaction.commandName === "userinfo"){

const user = interaction.options.getUser("usuario") || interaction.user
const member = interaction.guild.members.cache.get(user.id)

const embed = new EmbedBuilder()
.setTitle(user.username)
.setThumbnail(user.displayAvatarURL({dynamic:true}))
.addFields(
{name:"ID",value:user.id},
{name:"Conta criada",value:`<t:${Math.floor(user.createdTimestamp/1000)}:R>`},
{name:"Entrou no servidor",value:`<t:${Math.floor(member.joinedTimestamp/1000)}:R>`}
)

interaction.reply({embeds:[embed]})

}

if(interaction.commandName === "serverinfo"){

const guild = interaction.guild

const embed = new EmbedBuilder()
.setTitle(guild.name)
.setDescription(`Membros: ${guild.memberCount}`)

interaction.reply({embeds:[embed]})

}

if(interaction.commandName === "embed"){

const titulo = interaction.options.getString("titulo")
const descricao = interaction.options.getString("descricao")

const embed = new EmbedBuilder()
.setTitle(titulo)
.setDescription(descricao)
.setImage("https://i.supaimg.com/4094cff7-47c8-488d-8754-3d34606a8df4/8cabf436-ce4a-497a-9f69-975fbdd829ab.png")

interaction.reply({embeds:[embed]})

  }

if(interaction.commandName === "ticket"){

const embed = new EmbedBuilder()
.setTitle("Central de Atendimento")
.setDescription("Selecione uma opção para abrir ticket")
.setImage("https://i.supaimg.com/4094cff7-47c8-488d-8754-3d34606a8df4/8cabf436-ce4a-497a-9f69-975fbdd829ab.png")

const menu = new StringSelectMenuBuilder()
.setCustomId("ticket_menu")
.setPlaceholder("Escolha uma opção")
.addOptions([
{label:"SUPORTE",emoji:"⚒️",value:"suporte"},
{label:"REEMBOLSO",emoji:"💸",value:"reembolso"},
{label:"VAGAS",emoji:"👤",value:"vagas"},
{label:"RECEBER PREMIAÇÕES",emoji:"💰",value:"premio"}
])

const row = new ActionRowBuilder().addComponents(menu)

interaction.reply({embeds:[embed],components:[row]})

}

})

client.on("interactionCreate", async interaction => {

if(!interaction.isStringSelectMenu()) return

if(interaction.customId === "ticket_menu"){

ticketCount++

const categoria = interaction.guild.channels.cache.find(c => c.name === "╭─ 🛎️・ATENDIMENTO")

const canal = await interaction.guild.channels.create({
name:`ticket-${ticketCount}`,
type:ChannelType.GuildText,
parent:categoria ? categoria.id : null,
permissionOverwrites:[
{
id:interaction.guild.id,
deny:[PermissionsBitField.Flags.ViewChannel]
},
{
id:interaction.user.id,
allow:[PermissionsBitField.Flags.ViewChannel]
},
{
id:STAFF_ROLE,
allow:[PermissionsBitField.Flags.ViewChannel]
}
]
})

const row = new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("fechar_ticket")
.setLabel("🚫 Fechar Ticket")
.setStyle(ButtonStyle.Danger),

new ButtonBuilder()
.setCustomId("notificar_usuario")
.setLabel("👤 Notificar Usuário")
.setStyle(ButtonStyle.Primary)

)

const embed = new EmbedBuilder()
.setTitle("Ticket aberto")
.setDescription(`Usuário: ${interaction.user}`)

canal.send({embeds:[embed],components:[row]})

interaction.reply({content:`Ticket criado: ${canal}`,ephemeral:true})

}

})

client.on("interactionCreate", async interaction => {

if(!interaction.isButton()) return

if(!interaction.member.roles.cache.has(STAFF_ROLE))
return interaction.reply({content:"Apenas staff pode usar isso",ephemeral:true})

if(interaction.customId === "fechar_ticket"){

interaction.channel.delete()

}

if(interaction.customId === "notificar_usuario"){

const user = interaction.channel.permissionOverwrites.cache
.find(p => p.type === 1 && p.allow.has("ViewChannel"))

if(!user) return

const member = await client.users.fetch(user.id)

member.send("Você abriu um ticket e a equipe já foi notificada.")

interaction.reply({content:"Usuário notificado",ephemeral:true})

}

})

client.login(TOKEN)
