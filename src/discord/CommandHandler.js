
const { Collection } = require('discord.js')
var admin_command_list=['friend','unfriend','command',"guildchat","officerchat"]
class CommandHandler {
  constructor(discord) {
    this.discord = discord

    this.prefix = discord.app.config.discord.prefix

    this.commands = new Collection()
    let commandFiles = fs.readdirSync('./src/discord/commands').filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
      const command = new (require(`./commands/${file}`))(discord)
      this.commands.set(command.name, command)
    }
  }
  
  handle(message) {
    if (!message.content.startsWith(this.prefix)) {
      return false
    }
    

    let args = message.content.slice(this.prefix.length).trim().split(/ +/)
    let commandName = args.shift().toLowerCase()

    let command = this.commands.get(commandName)
      || this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

    if (!command) {
      return false
    }

    if ((admin_command_list.includes(command.name) && !this.isOwner(message.author) && !this.isCommander(message.author))) {
      message.channel.send({
        embeds: [
          {
            color: 'DC143C',
            description: `You don't have permission to do that.`
          
          }
        ]
      })
    return
    }


    this.discord.app.log.discord(`[${command.name}] ${message.content}`)
    command.onCommand(message)

    return true
  }

  isCommander(member) {
    return this.discord.app.config.discord.commanderIds.includes(member.id)
  }

  isOwner(member) {
    return member.id == this.discord.app.config.discord.ownerId
  }
}

module.exports = CommandHandler