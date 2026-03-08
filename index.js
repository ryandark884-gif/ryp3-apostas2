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
.setName("userinfo")
.setDescription("Informações do usuário")
.addUserOption(o=>o.setName("usuario").setDescription("Usuário")),

new SlashCommandBuilder()
.setName("serverinfo")
.setDescription("Informações do servidor")

].map(c=>c.toJSON())

const rest = new REST({version:"10"}).setToken(TOKEN)

client.once("ready",async()=>{

console.log(`✅ Bot online como ${client.user.tag}`)

try{

await rest.put(
Routes.applicationGuildCommands(CLIENT_ID,GUILD_ID),
{body:commands}
)

console.log("✅ Comandos registrados")

}catch(err){

console.error(err)

}

})

client.on("interactionCreate",async interaction=>{

if(interaction.isChatInputCommand()){

if(interaction.commandName==="help"){

const embed=new EmbedBuilder()
.setTitle("🤖 Comandos")
.setDescription(`
/ticket
/enviarmensagem
/limpar
/avatar
/userinfo
/serverinfo
`)

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
{name:"Conta criada",value:`<t:${parseInt(user.createdTimestamp/1000)}:R>`}
)

interaction.reply({embeds:[embed]})

}

if(interaction.commandName==="serverinfo"){

const guild=interaction.guild

const embed=new EmbedBuilder()
.setTitle("📊 Informações do Servidor")
.setThumbnail(guild.iconURL({dynamic:true}))
.addFields(
{name:"Nome",value:guild.name},
{name:"Membros",value:`${guild.memberCount}`},
{name:"ID",value:guild.id},
{name:"Criado",value:`<t:${parseInt(guild.createdTimestamp/1000)}:R>`}
)

interaction.reply({embeds:[embed]})

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

}

if(interaction.isStringSelectMenu()){

if(interaction.customId==="ticket_menu"){

const user=interaction.user

const category=interaction.guild.channels.cache.find(
c=>c.type===ChannelType.GuildCategory&&c.name==="╭─ 🛎️・ATENDIMENTO"
)

let channel

if(category){

channel=await interaction.guild.channels.create({
name:`ticket-${user.username}`,
type:ChannelType.GuildText,
parent:category.id,
permissionOverwrites:[
{id:interaction.guild.id,deny:[PermissionsBitField.Flags.ViewChannel]},
{id:user.id,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages]},
{id:STAFF_ROLE,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages]}
]
})

}else{

channel=await interaction.guild.channels.create({
name:`ticket-${user.username}`,
type:ChannelType.GuildText,
permissionOverwrites:[
{id:interaction.guild.id,deny:[PermissionsBitField.Flags.ViewChannel]},
{id:user.id,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages]},
{id:STAFF_ROLE,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages]}
]
})

}

const embed=new EmbedBuilder()
.setTitle("🎫 Ticket aberto")
.setDescription(`Aguarde atendimento ${user}`)

const buttons=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("assumir")
.setLabel("🛠 Assumir Ticket")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("add_user")
.setLabel("👤 Adicionar Usuário")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("notify")
.setLabel("📢 Notificar Usuário")
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("fechar")
.setLabel("🚫 Fechar Ticket")
.setStyle(ButtonStyle.Danger)

)

channel.send({embeds:[embed],components:[buttons]})

interaction.reply({content:`✅ Ticket criado: ${channel}`,ephemeral:true})

}

}

if(interaction.isButton()){

if(interaction.customId==="assumir"){
interaction.channel.send(`🛠 Ticket assumido por ${interaction.user}`)
}

if(interaction.customId==="fechar"){
interaction.channel.delete()
}

if(interaction.customId==="notify"){

const userPerm=interaction.channel.permissionOverwrites.cache.find(p=>p.type===1)

if(userPerm){

const target=await client.users.fetch(userPerm.id)

target.send("📩 Seu ticket recebeu resposta da equipe.")

interaction.reply({content:"✅ Usuário notificado",ephemeral:true})

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

}

if(interaction.isUserSelectMenu()){

if(interaction.customId==="select_user"){

const userId=interaction.values[0]

await interaction.channel.permissionOverwrites.edit(userId,{
ViewChannel:true,
SendMessages:true
})

interaction.reply({content:"✅ Usuário adicionado",ephemeral:true})

}

}

})

client.on("guildMemberAdd",async member=>{

const channel=member.guild.channels.cache.get(WELCOME_CHANNEL)

if(!channel)return

const embed=new EmbedBuilder()
.setTitle(`👋 Seja bem vindo ${member.user.username}`)
.setImage(member.user.displayAvatarURL({size:1024,dynamic:true}))

channel.send({embeds:[embed]})

})

client.login(TOKEN)
