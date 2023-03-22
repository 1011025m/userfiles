// ==UserScript==
// @name        View Twitch Commands In Chat
// @namespace   https://github.com/1011025m
// @match       https://www.twitch.tv/*
// @version     0.4
// @author      1011025m
// @description See all the available bot commands from popular bots that broadcasters use, from the comfort of your Twitch chat!
// @icon        https://i.imgur.com/q4rNQOb.png
// @license     MIT
// @home        https://github.com/1011025m/userfiles
// @updateURL   https://github.com/1011025m/userfiles/blob/main/userscripts/TwitchViewBotCommands.user.js
// @downloadURL https://github.com/1011025m/userfiles/blob/main/userscripts/TwitchViewBotCommands.user.js
// @unwrap
// ==/UserScript==

(() => {
    'use strict'

    const viewchatcommands_styles = document.createElement("style")
    // Some of this is taken from 7TV
    // Otherwise copied from Twitch to match the styling
    viewchatcommands_styles.innerText = `
    .viewchatcommands-button {
        cursor:pointer !important;
        display:flex;
        justify-content:center;
        width:3rem;
        height:3rem;
        position:relative;
    }

    .viewchatcommands-button:hover {
        border-radius:.4rem;
        background-color: var(--color-background-button-text-hover);
    }
    
    .viewchatcommands-button button {
        border:0;
        background:transparent;
        color:#fff;
        width:3rem;
        height:3rem;
        padding:0.5rem;
    }

    .viewchatcommands-button .open {
        background-image: url('https://i.imgur.com/q4rNQOb.png');
        background-size: contain;
        width:100%;
        height:100%;
        cursor:pointer;
    }

    .viewchatcommands-button .close {
        width:100%;
        height:100%;
        cursor:pointer;
        background-color: var(--color-fill-button-icon);
        mask-size: contain;
        -webkit-mask-size: contain;
        mask-image: url('https://i.imgur.com/Hpn6NZm.png');
        -webkit-mask-image: url('https://i.imgur.com/Hpn6NZm.png');
    }

    .viewchatcommands-panel {
        inset: 0px !important;
        background-color: var(--color-background-base) !important;
        position: absolute !important;
        z-index: 11 !important;
        overflow-x: hidden;
        overflow-y: scroll;
    }

    .viewchatcommands-panel__group {
        padding: 1.9rem !important;
        border-bottom: var(--border-width-default) solid var(--color-border-base) !important;
    }

    .viewchatcommands-panel__input {
        outline: none;
        width: 100%;
        padding: 0 1rem 0 1rem;
        height: var(--input-size-default);
        font-size: var(--input-text-default);
        color: var(--color-text-input);
        border: var(--border-width-input) solid;
        border-color: transparent;
        border-radius: var(--border-radius-medium);
        background-color: var(--color-background-input);
        transition: border-color var(--timing-short) ease-in, background-color var(--timing-short) ease-in;
    }

    .viewchatcommands-panel__input:hover {
        border-color: var(--color-border-input-hover);
    }

    .viewchatcommands-panel__input:focus {
        border-color: var(--color-border-input-focus);
        background-color: var(--color-background-input-focus);
    }

    .viewchatcommands-panel__group-header {
        display: flex !important;
        width: 100%;
        font-size: var(--font-size-4) !important;
        font-weight: var(--font-weight-semibold) !important;
        padding: .5rem 0 .5rem 0 !important;
    }

    .viewchatcommands-panel__group-header .icon {
        width: 3rem;
        height: 3rem;
        margin-right: 1rem;
        background-size: contain;
    }

    .viewchatcommands-panel__group-header .toggle {
        width: 3rem;
        height: 3rem;
        border-radius: .4rem;
        margin-left: auto;
        background-color: var(--color-text-base);
        -webkit-mask-image: url('https://i.imgur.com/pMlA8gc.png');
        mask-image: url('https://i.imgur.com/pMlA8gc.png');
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
        -webkit-mask-size: contain;
        mask-size: contain;
        transition: transform var(--timing-short) ease;
    }

    .viewchatcommands-panel__group.hidden .toggle {
        transform: rotate(180deg);
    }

    .viewchatcommands-panel__group-list {
        display: block;
    }

    .viewchatcommands-panel__group .command-wrapper {
        display: flex;
        flex-direction: column;
        word-break: break-word;
        margin-bottom: 1rem;
    }

    .viewchatcommands-panel:not(.filtered) .viewchatcommands-panel__group.hidden .command-wrapper, 
    .command-wrapper.hidden {
        display: none;
    }

    .viewchatcommands-panel__group .command-wrapper .command-name {
        font-size: var(--font-size-5);
        font-weight: bold;
    }

    .viewchatcommands-panel__group .command-wrapper .command-message {
        margin-left: 1rem;
    }

    .viewchatcommands-panel__group-warning {
        border: 2px solid #ff5f5f;
        border-radius: 0.5rem;
        color: #eee;
        background-color: #c38080;
        margin: .5rem 0 .5rem 0;
        padding: .5rem;
    }

    .viewchatcommands-loading {
        position: absolute;
        display: flex;
        height: 100%;
        width: 100%;
        background-color: var(--color-background-base);
        align-items: center;
        justify-content: center;
        flex-direction: column;
        z-index: 12;
    }

    .viewchatcommands-loading .icon {
        width: 5rem;
        height: 5rem;
        background-image: url('https://cdn.7tv.app/emote/63066409170b2d3c2cfc53f1/4x.webp');
        background-size: contain;
        background-repeat: no-repeat;
    }

    .viewchatcommands-loading .title {
        font-size: var(--font-size-4);
        font-weight: var(--font-weight-semibold);
    }

    .viewchatcommands-load .text {
        font-size: var(--font-size-5);
    }
    `
    document.head.appendChild(viewchatcommands_styles)

    const noCheckNames = [
        'directory',
        'videos',
        'user',
        'drops',
        'settings',
        'wallet',
        'subscriptions'
    ]

    const knownBots = {
        // Template
        /*
        BotName: {
            // A link to the bot's icon, currently it's just their respective Twitch pfps.
            icon: 'url',

            // Where to get the ID stored in the bot's database. Must be an array.
            get_id: (channel) => { return [`<check_id_endpoint>`] },

            // Get commands with the retrieved ID. Add headers if required. Must be an array.
            get_cmds: (id) => { return ['<commands_endpoint>', { headers: { } }] },

            // The ID's key from the get_id response.
            id_key: '_id',

            // Key of each command's name from the array of commands retrieved from get_cmds.
            cmd_name_key: 'name',

            // Same as above, except for the response.
            cmd_msg_key: 'message',

            // Optional. Use this if prefix must be used for commands.
            enforced_prefix: '!'
        }
        */
        Nightbot: {
            icon: 'https://static-cdn.jtvnw.net/jtv_user_pictures/nightbot-profile_image-2345338c09b4d468-50x50.png',
            get_id: (channel) => { return [`https://api.nightbot.tv/1/channels/t/${channel}`] },
            get_cmds: (id) => { return ['https://api.nightbot.tv/1/commands', { headers: { 'Nightbot-Channel': id } }] },
            id_key: '_id',
            cmd_name_key: 'name',
            cmd_msg_key: 'message'
        },
        Fossabot: {
            icon: 'https://static-cdn.jtvnw.net/jtv_user_pictures/719a0ffa-6c86-4321-83f1-44990fd644bc-profile_image-50x50.png',
            get_id: (channel) => { return [`https://api.fossabot.com/v2/cached/channels/by-slug/${channel}`] },
            get_cmds: (id) => { return [`https://api.fossabot.com/v2/cached/channels/${id}/commands`] },
            id_key: 'id',
            cmd_name_key: 'name',
            cmd_msg_key: 'response',
            enforced_prefix: '!'
        },
        StreamElements: {
            icon: 'https://static-cdn.jtvnw.net/jtv_user_pictures/streamelements-profile_image-a89b9d61499d365f-50x50.png',
            get_id: (channel) => { return [`https://api.streamelements.com/kappa/v2/channels/${channel}`] },
            get_cmds: (id) => { return [`https://api.streamelements.com/kappa/v2/bot/commands/${id}/public`] },
            id_key: '_id', // This one is special, because it's not inside a channel object!
            cmd_name_key: 'command',
            cmd_msg_key: 'reply',
            enforced_prefix: '!'
        },
        Moobot: {
            icon: 'https://static-cdn.jtvnw.net/jtv_user_pictures/663db70b-80e7-424b-a54f-ed88f7ac9355-profile_image-50x50.png',
            get_id: (channel) => { return [`https://api.moo.bot/1/channel/meta?name=${channel}`] },
            get_cmds: (id) => { return [`https://api.moo.bot/1/channel/public/commands/list?channel=${id}`] },
            id_key: 'userid',
            cmd_name_key: 'identifier',
            cmd_msg_key: 'response'
        },
        Streamlabs: { // Also called Cloudbot
            // CORS issue, same cloudflare workers trick
            icon: 'https://static-cdn.jtvnw.net/jtv_user_pictures/68445d99-b612-463c-a3d1-125283adcbf3-profile_image-50x50.png',
            get_id: (channel) => { return [`https://cloudbot-cors.1011025m.workers.dev/user/${channel}`] },
            get_cmds: (id) => { return [`https://cloudbot-cors.1011025m.workers.dev/commands/${id}`] },
            id_key: 'token', // Same with StreamElements, not inside an object.
            cmd_name_key: 'command',
            cmd_msg_key: 'response'
        }
        /*
        // Add support for Supibot later
        Supibot: {
            // Supibot is a general purpose bot. Does not require ID to fetch their commands.
            get_cmds: [`https://supinic.com/api/bot/command/list/`]
        }
        */

        // Support for KsyncBot? Does not seem to have an endpoint that returns commands.
        // Their command list page is SSR, FeelsDankMan!!!

        // Add support for pajbot later - https://pajbot.com/
        // Pajbot is a custom Twitch bot, some big streamers use it (xQc, Forsen, etc...)
        // Endpoint for each channel is on their own subdomain, which sucksssss

        // No support for gempbot - nowhere I can fetch their commands
    }

    const botWarnings = {
        notConnectedToChannel: "This bot is not connected to the channel's chat, so you cannot use their commands here.",
        connectedToAccountNoCommands: "This channel authorized the bot with their account, but currently has not set up any commands.",
        notModerator: "This bot is not a moderator of this channel's chat, some commands may not work."
    }

    class BotCommands {
        constructor(channel) {
            this.channel = channel
            this.id = {}
            this.cmds = {}
            this.bot_status = {}
        }

        async getIdFrom(bot) {
            if (bot in knownBots) {
                const botInfo = knownBots[bot]
                await fetch(botInfo.get_id(this.channel)[0], botInfo.get_id(this.channel)[1])
                .then(async resp => {
                    if (resp.status === 200) {
                        await resp.json().then(async data => {
                            if ('channel' in data) {this.id[bot] = data.channel[botInfo.id_key]}
                            else if (botInfo.id_key in data) {this.id[bot] = data[botInfo.id_key]}
                            else console.warn(`${this.channel} does not use ${bot}!`)
                        })
                    } else { console.warn(`${this.channel} does not use ${bot}!`) }
                })
                .catch(err => { console.warn(`${bot} did not return anything...`); console.warn(err) })
            }
            else throw `${bot} is not in the list of known bots...`
            return this.id[bot]
        }

        async getFrom(bot) {
            if (bot in knownBots && bot in this.id) {
                const botInfo = knownBots[bot]
                await fetch(botInfo.get_cmds(this.id[bot])[0], botInfo.get_cmds(this.id[bot])[1])
                .then(async resp => {
                    if (resp.status === 200) {
                        await resp.json().then(async data => {
                            if ('commands' in data) this.cmds[bot] = data.commands // Nightbot, Fossabot
                            else if ('list' in data) this.cmds[bot] = data.list // Moobot
                            else { // StreamElements, Cloudbot
                                this.cmds[bot] = data 
                                console.warn(`${bot} did not return commands...`)
                            }
                        })
                    }
                })
                .catch(err => { console.warn(`${bot} did not return commands...`) })
            }
            else console.warn(`${bot} ID not retrieved - do that before fetching commands.`)
            return this.cmds[bot]
        }

        async getIdFromAll() {
            for (const k of Object.keys(knownBots)) await this.getIdFrom(k)
        }

        async getFromAll() {
            await this.getIdFromAll()
            for (const bot of Object.keys(this.id)) await this.getFrom(bot)
        }

        async isBotConnected(bot) {
            if (bot in this.bot_status) { return this.bot_status[bot] }
            let isConnected = false
            let roleOfBot = undefined
            // There's an undocumented Twitch IRC server endpoint that returns usersnames, all in lowercase
            // The endpoint itself doesn't support CORS, BRUH!!!!
            // Using Cloudflare Workers to alleviate the issue
            if (!this.viewer_list) {
                await fetch(`https://twitch-tmi.1011025m.workers.dev/${this.channel}`)
                .then(async resp => {
                    if (resp.status === 200) {
                        await resp.json().then(data => {
                            this.viewer_list = data
                        })
                    }
                })
            }
            for (const role in this.viewer_list.chatters) {
                if (this.viewer_list.chatters[role].includes(bot.toLowerCase())) {
                    isConnected = true
                    roleOfBot = (role.slice(-1) === 's' ? role.slice(0, -1): role) // Plural to singular
                }
            }
            const status = { connected: isConnected, role: roleOfBot }
            this.bot_status[bot] = status
            return status
        }
    }

    async function checkBotCommands(channel) {
        const channelCommands = (visitedChannels[channel] ? visitedChannels[channel] : new BotCommands(channel))
        visitedChannels[channel] = channelCommands
        if (Object.keys(channelCommands.cmds).length === 0) { console.log('Checking commands'); await channelCommands.getFromAll() }
        for (const k of Object.keys(channelCommands.cmds)) { // Debug use
            console.log(k) // Bot name
            // channelCommands.cmds[k].forEach(cmd => {
            //    console.log(`${cmd[knownBots[k].cmd_name_key]}: ${cmd[knownBots[k].cmd_msg_key]}`)
            // })
        }
    }

    async function createBotWarning(panelGroupElem, msg) {
        console.log(msg)
        const botWarningModal = document.createElement('div')
        botWarningModal.classList.add('viewchatcommands-panel__group-warning')
        botWarningModal.innerText = msg
        panelGroupElem.append(botWarningModal)
    }

    async function filterCommandList(filter) {
        if (!filter) {
            document.querySelector('.viewchatcommands-panel').classList.remove('filtered')
            document.querySelectorAll('.command-wrapper.hidden').forEach(cmd => { cmd.classList.remove('hidden') })
        }
        else {
            document.querySelector('.viewchatcommands-panel').classList.add('filtered')
            document.querySelectorAll('.viewchatcommands-panel .command-name').forEach(cmd_name => {
                if (!cmd_name.innerText.includes(filter)) { cmd_name.parentNode.classList.add('hidden') }
                else { cmd_name.parentNode.classList.remove('hidden') }
            })
        }
    }

    async function renderCommandList() {
        // Create Container
        const chatInputContainer = document.querySelector('.bGyiZe')
        const commandListContainer = document.createElement('div')
        commandListContainer.classList.add('viewchatcommands-panel')
        chatInputContainer.insertAdjacentElement('beforebegin', commandListContainer)

        // Change Header Text
        let chatHeader = document.querySelector('#chat-room-header-label')
        const chatHeaderText_Original = structuredClone(chatHeader.innerText)
        chatHeader.innerText = 'Bot Commands'
        document.querySelector('button[data-test-selector="chat-viewer-list"]').style.display = 'none'

        // Close Button
        const commandListCloseButton = document.createElement('div')
        commandListCloseButton.classList.add('viewchatcommands-button')
        document.querySelector('.fFrDeB').insertAdjacentElement('afterbegin', commandListCloseButton)
        const childDiv = document.createElement('div')
        commandListCloseButton.append(childDiv)
        const childButton = document.createElement('button')
        childDiv.append(childButton)
        const iconDiv = document.createElement('div')
        iconDiv.classList.add('close')
        childButton.append(iconDiv)

        // Add placeholder when loading commands
        const loadingPlaceholder = document.createElement('div')
        loadingPlaceholder.classList.add('viewchatcommands-loading')
        chatInputContainer.insertAdjacentElement('beforebegin', loadingPlaceholder)
        const loadingPlaceholderIcon = document.createElement('div')
        loadingPlaceholderIcon.classList.add('icon')
        loadingPlaceholder.append(loadingPlaceholderIcon)
        const loadingPlaceholderTitle = document.createElement('span')
        loadingPlaceholderTitle.classList.add('title')
        loadingPlaceholderTitle.innerText = 'Loading Commands...'
        loadingPlaceholder.append(loadingPlaceholderTitle)
        const loadingPlaceholderText = document.createElement('span')
        loadingPlaceholderText.classList.add('text')
        loadingPlaceholderText.innerText = 'This will take a few seconds.'
        loadingPlaceholder.append(loadingPlaceholderText)
        await checkBotCommands(currChannelName)

        // Render the commands in groups
        const listSearchRegion = document.createElement('div')
        listSearchRegion.classList.add('viewchatcommands-panel__group')
        listSearchRegion.classList.add('filter')
        commandListContainer.append(listSearchRegion)
        const commandSearchBar = document.createElement('input')
        commandSearchBar.classList.add('viewchatcommands-panel__input')
        commandSearchBar.type = 'search'
        commandSearchBar.placeholder = 'Filter'
        listSearchRegion.append(commandSearchBar)

        const currChannelCommands = visitedChannels[currChannelName].cmds
        for (const botcmds in currChannelCommands) {
            // Initialize group for each bot
            const individualBotListRegion = document.createElement('div')
            individualBotListRegion.classList.add('viewchatcommands-panel__group')
            individualBotListRegion.classList.add('bot-commands')
            commandListContainer.append(individualBotListRegion)
            // Make header
            const botListRegionHeaderText = document.createElement('div')
            botListRegionHeaderText.classList.add('viewchatcommands-panel__group-header')
            botListRegionHeaderText.innerText = botcmds
            individualBotListRegion.append(botListRegionHeaderText)
            // Make icon
            const botIcon = document.createElement('div')
            botIcon.classList.add('icon')
            botIcon.style.backgroundImage = `url('${knownBots[botcmds].icon}')`
            botListRegionHeaderText.prepend(botIcon)
            // Make toggle button
            const toggleVisibilityButton = document.createElement('button')
            toggleVisibilityButton.classList.add('toggle')
            botListRegionHeaderText.append(toggleVisibilityButton)
            // Bind event to toggle button
            toggleVisibilityButton.onclick = async () => {
                if (individualBotListRegion.classList.contains('hidden')) {
                    individualBotListRegion.classList.remove('hidden')
                }
                else {
                    individualBotListRegion.classList.add('hidden')
                }
            }

            // Create warning if criteria is met
            let { connected, role } = await visitedChannels[currChannelName].isBotConnected(botcmds)
            console.log(botcmds)
            if (!connected) {
                await createBotWarning(individualBotListRegion, botWarnings.notConnectedToChannel)
                individualBotListRegion.classList.add('hidden')
            }
            else if (currChannelCommands[botcmds].length === 0) {
                await createBotWarning(individualBotListRegion, botWarnings.connectedToAccountNoCommands)
                individualBotListRegion.classList.add('hidden')
            }
            else if (role !== 'moderator') {
                await createBotWarning(individualBotListRegion, botWarnings.notModerator)
            }

            // Render each command
            for (const cmd of currChannelCommands[botcmds]) {
                if (cmd.enabled === false || !cmd[knownBots[botcmds].cmd_msg_key]) {continue}
                const commandWrapper = document.createElement('div')
                commandWrapper.classList.add('command-wrapper')
                const commandName = document.createElement('div')
                commandName.classList.add('command-name')
                if (knownBots[botcmds].hasOwnProperty('enforced_prefix')) {
                    commandName.innerText = `${knownBots[botcmds].enforced_prefix}${cmd[knownBots[botcmds].cmd_name_key]}:`
                }
                else {
                    commandName.innerText = `${cmd[knownBots[botcmds].cmd_name_key]}:`
                }
                const commandMessage = document.createElement('div')
                commandMessage.classList.add('command-message')
                commandMessage.innerText = `${cmd[knownBots[botcmds].cmd_msg_key]}`
                individualBotListRegion.append(commandWrapper)
                commandWrapper.append(commandName)
                commandWrapper.append(commandMessage)
            }
        }

        // Remove loading container
        loadingPlaceholder.remove()

        // Garbage collect the viewer list
        visitedChannels[currChannelName].viewer_list = null

        commandSearchBar.oninput = async () => {
            await filterCommandList(commandSearchBar.value)
        }

        childButton.onclick = async () => {
            await closeCommandList(commandListCloseButton, commandListContainer, chatHeaderText_Original)
        }

    }

    async function closeCommandList(closeButton, commandList, headerText) {
        commandList.remove()
        closeButton.remove()
        document.querySelector('#chat-room-header-label').innerText = headerText
        document.querySelector('button[data-test-selector="chat-viewer-list"]').removeAttribute("style")
    }

    function injectViewCommandsButton() {
        const chatSendButton = document.querySelector('.hOyRCN .kaXoQh')
        const viewCommandsButton = document.createElement('div')
        viewCommandsButton.classList.add('viewchatcommands-button')
        chatSendButton.insertAdjacentElement('beforebegin', viewCommandsButton)
        const childDiv = document.createElement('div')
        viewCommandsButton.append(childDiv)
        const childButton = document.createElement('button')
        childDiv.append(childButton)
        const iconDiv = document.createElement('div')
        iconDiv.classList.add('open')
        childButton.append(iconDiv)

        childButton.onclick = async () => {
            await renderCommandList()
        }
    }


    // Run
    let currChannelName = null
    let visitedChannels = {} // Storage for all the BotCommands objects, in case user switches back and forth between channels.
    console.log('Monitoring channel change')

    async function checkChannelName() {
        // channelName is given in the Twitch interface (unreliable)
        const currURL = document.URL
        const channelNameRegEx = /(?<=\/popout\/|\/embed\/)(.+?)(?=\/chat)/.exec(currURL) || /(?<=twitch.tv\/)(.+?)(?=[\/\?]|$)/.exec(currURL)
        if (channelNameRegEx == null || noCheckNames.includes(channelNameRegEx[0])) {
            currChannelName = null
        } else if (currChannelName !== channelNameRegEx[0]) { 
            console.log(`Channel changed to ${channelNameRegEx[0]}`)
            currChannelName = channelNameRegEx[0]
            injectViewCommandsButton()
        }
    }
    setInterval(checkChannelName, 2000);
})()