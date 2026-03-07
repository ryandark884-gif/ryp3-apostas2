const { 
Client, 
GatewayIntentBits, 
ActionRowBuilder, 
ButtonBuilder, 
ButtonStyle, 
StringSelectMenuBuilder, 
ChannelType, 
PermissionsBitField, 
SlashCommandBuilder, 
EmbedBuilder 
} = require("discord.js")

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildMembers
]
})

const STAFF_ROLE = "1463148647972737118"
const LOG_CHANNEL = "1473752382541402162"

client.once("ready", () => {
console.log(`Bot online: ${client.user.tag}`)
})

client.on("interactionCreate", async interaction => {

if(interaction.isChatInputCommand()){

if(interaction.commandName === "ticket"){

const embed = new EmbedBuilder()
.setTitle("🎟️ Central de Atendimento")
.setDescription("Selecione uma opção abaixo para abrir um ticket.")
.setColor("Blue")

const menu = new StringSelectMenuBuilder()
.setCustomId("ticket_menu")
.setPlaceholder("Escolha uma opção")
.addOptions([
{
label:"SUPORTE",
description:"Abrir ticket de suporte",
emoji:"⚒️",
value:"suporte"
},
{
label:"REEMBOLSO",
description:"Solicitar reembolso",
emoji:"💸",
value:"reembolso"
},
{
label:"VAGAS",
description:"Solicitar vaga",
emoji:"👤",
value:"vagas"
},
{
label:"RECEBER PREMIAÇÕES",
description:"Receber premiação",
emoji:"💰",
value:"premio"
}
])

const row = new ActionRowBuilder().addComponents(menu)

interaction.reply({embeds:[embed],components:[row]})

}

if(interaction.commandName === "enviarmensagem"){

const msg = interaction.options.getString("mensagem")

await interaction.channel.send(msg)

await interaction.reply({content:"✅ Mensagem enviada.",ephemeral:true})

}

if(interaction.commandName === "limpar"){

const quantidade = interaction.options.getInteger("quantidade")

await interaction.channel.bulkDelete(quantidade)

interaction.reply({content:`🧹 ${quantidade} mensagens apagadas.`,ephemeral:true})

}

}

if(interaction.isStringSelectMenu()){

if(interaction.customId === "ticket_menu"){

const escolha = interaction.values[0]

const canal = await interaction.guild.channels.create({
name:`ticket-${interaction.user.username}`,
type:ChannelType.GuildText,
permissionOverwrites:[
{
id:interaction.guild.id,
deny:[PermissionsBitField.Flags.ViewChannel]
},
{
id:interaction.user.id,
allow:[
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
},
{
id:STAFF_ROLE,
allow:[
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
}
]
})

const embed = new EmbedBuilder()
.setTitle("🎫 Ticket aberto")
.setDescription(`Usuário: ${interaction.user}\nCategoria: **${escolha}**\n\nAguarde um administrador.`)
.setColor("Green")

const fechar = new ButtonBuilder()
.setCustomId("fechar_ticket")
.setLabel("FECHAR TICKET")
.setEmoji("🚫")
.setStyle(ButtonStyle.Danger)

const notificar = new ButtonBuilder()
.setCustomId("notificar_user")
.setLabel("NOTIFICAR USUÁRIO")
.setEmoji("👤")
.setStyle(ButtonStyle.Primary)

const adicionar = new ButtonBuilder()
.setCustomId("add_user")
.setLabel("ADICIONAR USUÁRIO")
.setEmoji("🚨")
.setStyle(ButtonStyle.Secondary)

const row = new ActionRowBuilder().addComponents(fechar,notificar,adicionar)

canal.send({embeds:[embed],components:[row]})

interaction.reply({content:`✅ Ticket criado: ${canal}`,ephemeral:true})

const log = interaction.guild.channels.cache.get(LOG_CHANNEL)

if(log){
log.send(`📂 Ticket aberto por ${interaction.user}`)
}

}

}

if(interaction.isButton()){

if(!interaction.member.roles.cache.has(STAFF_ROLE)){

return interaction.reply({
content:"❌ Apenas administradores podem usar estes botões.",
ephemeral:true
})

}

if(interaction.customId === "fechar_ticket"){

interaction.channel.delete()

const log = interaction.guild.channels.cache.get(LOG_CHANNEL)

if(log){
log.send(`🔒 Ticket fechado por ${interaction.user}`)
}

}

if(interaction.customId === "notificar_user"){

const nome = interaction.channel.name
const userName = nome.replace("ticket-","")

const membro = interaction.guild.members.cache.find(m => m.user.username === userName)

if(!membro){
return interaction.reply({content:"❌ Usuário não encontrado.",ephemeral:true})
}

membro.send(`📩 Você abriu um ticket no servidor **${interaction.guild.name}**.\nNossa equipe já irá atender você.`)

interaction.reply({content:"📨 Usuário notificado.",ephemeral:true})

}

if(interaction.customId === "add_user"){

interaction.reply({
content:"Use o comando **/adduser** para adicionar alguém.",
ephemeral:true
})

}

}

})

client.login(process.env.TOKEN)
