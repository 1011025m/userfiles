// ==UserScript==
// @name        View Twitch Commands In Chat
// @namespace   https://github.com/1011025m
// @match       https://www.twitch.tv/*
// @version     0.10
// @author      1011025m
// @description See all the available bot commands from popular bots that broadcasters use, from the comfort of your Twitch chat!
// @icon        https://i.imgur.com/q4rNQOb.png
// @license     MIT
// @home        https://github.com/1011025m/userfiles
// @updateURL   https://github.com/1011025m/userfiles/raw/main/userscripts/TwitchViewBotCommands.user.js
// @downloadURL https://github.com/1011025m/userfiles/raw/main/userscripts/TwitchViewBotCommands.user.js
// @unwrap
// ==/UserScript==
(() => {
    'use strict'

    const viewchatcommands_styles = document.createElement("style")
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
        border-radius:50%;
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

    /* The Twitch dev who switched this to box-shadow should be fired! */
    .viewchatcommands-panel__input {
        outline: none;
        width: 100%;
        padding: 0 1rem 0 1rem;
        height: var(--input-size-default);
        font-size: var(--input-text-default);
        color: var(--color-text-input);
        border: 0;
        border-radius: var(--border-radius-medium);
        box-shadow: inset 0 0 0 var(--input-border-width-small) var(--color-border-input);
        background-color: var(--color-background-input);
        transition: all var(--timing-short) ease-in;
    }

    .viewchatcommands-panel__input:hover {
        box-shadow: inset 0 0 0 var(--input-border-width-default) var(--color-border-input-hover);
    }

    .viewchatcommands-panel__input:focus {
        box-shadow: 0 0 0 var(--input-border-width-default) var(--color-border-input-focus),inset 0 0 0 var(--input-border-width-default) var(--color-border-input-focus);
        outline-offset: -1px;
        background-color: var(--color-background-input-focus);
    }

    .viewchatcommands-panel__group-header {
        display: flex !important;
        align-items: center;
        width: 100%;
        font-size: var(--font-size-3) !important;
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
        font-size: var(--font-size-4);
        font-weight: bold;
    }

    .viewchatcommands-panel__group .command-wrapper .command-message {
        font-size: var(--font-size-5);
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

    .viewchatcommands-loading, .viewchatcommands-notfound {
        position: absolute;
        top: 0;
        display: flex;
        height: 100%;
        width: 100%;
        background-color: var(--color-background-base);
        align-items: center;
        justify-content: center;
        flex-direction: column;
        text-align: center;
        z-index: 12;
    }

    .viewchatcommands-loading .icon {
        width: 5rem;
        height: 5rem;
        background-image: url('https://cdn.7tv.app/emote/63066409170b2d3c2cfc53f1/4x.webp');
        background-size: contain;
        background-repeat: no-repeat;
    }

    .viewchatcommands-loading .title, .viewchatcommands-notfound .title {
        font-size: var(--font-size-3);
        font-weight: var(--font-weight-semibold);
    }

    .viewchatcommands-load .text, .viewchatcommands-notfound .text {
        font-size: var(--font-size-4);
    }

    .viewchatcommands-notfound .icon {
        width: 5rem;
        height: 5rem;
        background-image: url('https://cdn.7tv.app/emote/60f0ca3f48cde2fcc38c9e06/4x.webp');
        background-size: contain;
        background-repeat: no-repeat;
    }

    .viewchatcommands-panel:has(.viewchatcommands-notfound) {
        overflow-y: hidden !important;
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

    // Warning enums
    const botWarnings = {
        notConnectedToChannel: "This bot is not connected to the channel's chat, so you cannot use their commands here.",
        connectedToAccountNoCommands: "This channel authorized the bot with their account, but currently has not set up any commands.",
        notModerator: "This bot is not a moderator of this channel's chat, some commands may not work."
    }

    // Console outputs
    // This is bad for debugging. Removing this later.
    const output = {
        prefix: '[TwitchViewBotCommands]',
        log: function(msg) {
            console.log(this.prefix, msg)
        },
        warn: function(msg)  {
            console.warn(this.prefix, msg)
        }
    }

    const getChatterList = async (channelName) => {
        // Twitch GQL request data
        const payload = {
            "operationName": "ChatViewers",
            "variables": {
                // Twitch usernames (not display names!) are all lowercase
                "channelLogin": channelName.toLowerCase(),
            },
            "extensions": {
                "persistedQuery": {
                    "version": 1,
                    "sha256Hash": "e0761ef5444ee3acccee5cfc5b834cbfd7dc220133aa5fbefe1b66120f506250"
                }
            }
        }

        // Send the request
        const res = await fetch('https://gql.twitch.tv/gql', {
            method: 'POST',
            cache: 'no-cache',
            headers: {"Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko"},
            body: JSON.stringify(payload)

        })

        if (res.status === 200) {
            const resChatters = (await res.json()).data.channel.chatters

            let chattersArr = {}
            for (const role in resChatters) {
                if (role === "count" || role === "__typename") continue
                chattersArr[role] = resChatters[role].map(user => user.login)
            }

            return {chatters: chattersArr}
        }
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
                            else output.warn(`${this.channel} does not use ${bot}!`)
                        })
                    } else { output.warn(`${this.channel} does not use ${bot}!`) }
                })
                .catch(err => { output.warn(`${bot} did not return anything...`); output.warn(err) })
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
                                // output.warn(`${bot} did not return commands...`)
                            }
                        })
                    }
                })
                .catch(err => { output.warn(`${bot} did not return commands...`) })
            }
            else output.warn(`${bot} ID not retrieved - do that before fetching commands.`)
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
            // To get a list of viewers in the chat, we use the GraphQL endpoint that Twitch uses
            // Note that it doesn't return all chatters, so it'll definitely be a hit and miss.
            if (!this.viewer_list) {
                this.viewer_list = await getChatterList(this.channel)
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
        if (Object.keys(channelCommands.cmds).length === 0) { output.log('Checking commands'); await channelCommands.getFromAll() }
        for (const k of Object.keys(channelCommands.cmds)) { // Debug use
            output.log(`Got commands for ${k}`) // Bot name
            // channelCommands.cmds[k].forEach(cmd => {
            //    output.log(`${cmd[knownBots[k].cmd_name_key]}: ${cmd[knownBots[k].cmd_msg_key]}`)
            // })
        }
    }

    async function createBotWarning(panelGroupElem, msg) {
        output.log(msg)
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
        const chatInputContainer = document.querySelector('.chat-room__content')
        const commandListContainer = document.createElement('div')
        commandListContainer.classList.add('viewchatcommands-panel')
        chatInputContainer.insertAdjacentElement('afterbegin', commandListContainer)

        // Change Header Text
        let chatHeader = document.querySelector('#chat-room-header-label')
        const chatHeaderText_Original = structuredClone(chatHeader.innerText)
        chatHeader.innerText = 'Bot Commands'
        document.querySelector('button[data-test-selector="chat-viewer-list"]').style.display = 'none'

        // Close Button
        const commandListCloseButton = document.createElement('div')
        commandListCloseButton.classList.add('viewchatcommands-button')
        document.querySelector('.stream-chat-header div:last-child').insertAdjacentElement('beforeend', commandListCloseButton)
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
        chatInputContainer.insertAdjacentElement('afterbegin', loadingPlaceholder)
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
        // Lazy variable to check if there are commands
        let channelHasActiveCommands = false
        const currChannelCmds = visitedChannels[currChannelName].cmds
        for (const bot in currChannelCmds) {
            // Cloudbot: Even if broadcaster does not use the bot,
            // if authenticated with Streamlabs, there will still be default commands.
            // Skip it entirely if only the moderator (default) commands are found.
            if (bot === "Streamlabs" && currChannelCmds[bot].filter(c => c[knownBots[bot].cmd_msg_key]).length === 0) {
                continue
            }
            // StreamElements: Commands can be disabled
            // Skip entirely if no enabled commands.
            if (bot === "StreamElements" && currChannelCmds[bot].filter(c => c.enabled === true).length === 0) {
                continue
            }
            // Some bots will still return if no commands
            // Pass if no commands.
            if (currChannelCmds[bot].length === 0) {
                continue
            }
            // If all of above is passed, it means there is at least one active command.
            channelHasActiveCommands = true
            // Initialize group for each bot
            const individualBotListRegion = document.createElement('div')
            individualBotListRegion.classList.add('viewchatcommands-panel__group')
            individualBotListRegion.classList.add('bot-commands')
            commandListContainer.append(individualBotListRegion)
            // Make header
            const botListRegionHeaderText = document.createElement('div')
            botListRegionHeaderText.classList.add('viewchatcommands-panel__group-header')
            botListRegionHeaderText.innerText = bot
            individualBotListRegion.append(botListRegionHeaderText)
            // Make icon
            const botIcon = document.createElement('div')
            botIcon.classList.add('icon')
            botIcon.style.backgroundImage = `url('${knownBots[bot].icon}')`
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
            let { connected, role } = await visitedChannels[currChannelName].isBotConnected(bot)
            output.log(`Checking status of ${bot}`)
            if (!connected) {
                await createBotWarning(individualBotListRegion, botWarnings.notConnectedToChannel)
                individualBotListRegion.classList.add('hidden')
            }
            else if (currChannelCmds[bot].length === 0) {
                await createBotWarning(individualBotListRegion, botWarnings.connectedToAccountNoCommands)
                individualBotListRegion.classList.add('hidden')
            }
            else if (role !== 'moderator') {
                await createBotWarning(individualBotListRegion, botWarnings.notModerator)
            }

            // Render each command
            for (const cmd of currChannelCmds[bot]) {
                if (cmd.enabled === false || !cmd[knownBots[bot].cmd_msg_key]) continue
                const commandWrapper = document.createElement('div')
                commandWrapper.classList.add('command-wrapper')
                const commandName = document.createElement('div')
                commandName.classList.add('command-name')
                if (knownBots[bot].hasOwnProperty('enforced_prefix')) {
                    commandName.innerText = `${knownBots[bot].enforced_prefix}${cmd[knownBots[bot].cmd_name_key]}:`
                }
                else {
                    commandName.innerText = `${cmd[knownBots[bot].cmd_name_key]}`
                }
                const commandMessage = document.createElement('div')
                commandMessage.classList.add('command-message')
                commandMessage.innerHTML = `${cmd[knownBots[bot].cmd_msg_key].replaceAll(/(?:https?)[^ ]+/g, "<a href=\"$&\">$&</a>")}`
                individualBotListRegion.append(commandWrapper)
                commandWrapper.append(commandName)
                commandWrapper.append(commandMessage)
            }
        }

        if (channelHasActiveCommands) {
            // Create filter input
            const listSearchRegion = document.createElement('div')
            listSearchRegion.classList.add('viewchatcommands-panel__group')
            listSearchRegion.classList.add('filter')
            commandListContainer.insertAdjacentElement('afterbegin', listSearchRegion)
            const commandSearchBar = document.createElement('input')
            commandSearchBar.classList.add('viewchatcommands-panel__input')
            commandSearchBar.type = 'search'
            commandSearchBar.placeholder = 'Filter'
            listSearchRegion.append(commandSearchBar)

            // Activate it
            commandSearchBar.oninput = async () => {
                await filterCommandList(commandSearchBar.value)
            }
        } else {
            // Create notice if no active commands.
            const noCommandsNotice = document.createElement('div')
            noCommandsNotice.classList.add('viewchatcommands-notfound')
            commandListContainer.insertAdjacentElement('afterbegin', noCommandsNotice)
            const noCommandsNoticeIcon = document.createElement('div')
            noCommandsNoticeIcon.classList.add('icon')
            noCommandsNotice.append(noCommandsNoticeIcon)
            const noCommandsNoticeTitle = document.createElement('span')
            noCommandsNoticeTitle.classList.add('title')
            noCommandsNoticeTitle.innerText = 'No Commands Found'
            noCommandsNotice.append(noCommandsNoticeTitle)
            const noCommandsNoticeText = document.createElement('span')
            noCommandsNoticeText.classList.add('text')
            noCommandsNoticeText.innerText = 'This channel does not have active custom commands!'
            noCommandsNotice.append(noCommandsNoticeText)
        }

        // Remove loading container
        loadingPlaceholder.remove()

        // Garbage collect the viewer list
        visitedChannels[currChannelName].viewer_list = null

        childButton.onclick = async () => {
            await closeCommandList(commandListCloseButton, commandListContainer, chatHeaderText_Original)
        }

        output.log("Render finished")
    }

    async function closeCommandList(closeButton, commandList, headerText) {
        commandList.remove()
        closeButton.remove()
        document.querySelector('#chat-room-header-label').innerText = headerText
        document.querySelector('button[data-test-selector="chat-viewer-list"]').removeAttribute("style")
    }

    function isChatLoaded() {
        const chatRoomExists = document.querySelector('.chat-room__content')
        if (chatRoomExists) return true
        else return false
    }

    function isButtonLoaded() {
        const buttonExists = document.querySelector('.viewchatcommands-button')
        if (buttonExists) return true
        else return false
    }

    function injectViewCommandsButton() {
        const chatButtonsRightContainer = document.querySelector('.chat-input__buttons-container div:has(button[data-a-target="chat-send-button"]) div:last-child')
        const viewCommandsButton = document.createElement('div')
        viewCommandsButton.classList.add('viewchatcommands-button')
        chatButtonsRightContainer.insertAdjacentElement('afterbegin', viewCommandsButton)
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
    // Storage for all the BotCommands objects,
    // in case user switches back and forth between channels.
    let visitedChannels = {}
    output.log('Script initialized.')

    async function checkChannelName() {
        // channelName is given in the Twitch interface (unreliable)
        const currURL = document.URL
        const channelNameRegEx = [
            /(?<=\/popout\/|\/embed\/|\/moderator\/)(.+?)(?=\/chat|\/|$)/,
            /(?<=twitch.tv\/)(?!popout|embed|moderator)(.+?)(?=[\/\?]|$)/
        ]
        for (const re of channelNameRegEx) {
            const reExec = re.exec(currURL)
            if (reExec === null) continue
            if (noCheckNames.includes(reExec[0])) { currChannelName = null; return }
            if (currChannelName !== reExec[0]) {
                output.log(`Channel changed to ${reExec[0]}`)
                currChannelName = reExec[0]
                injectViewCommandsButton()
                return
            }
            else {
                if (isChatLoaded() && !isButtonLoaded()) {
                    injectViewCommandsButton()
                    output.log('Button not found, reinjecting.')
                }
                return
            }
        }
    }

    // Have to wait for 7TV to load first
    setTimeout(() => {
        if (window.seventv !== undefined) {
            output.log("Cooling down for 7TV initialization...")
            setTimeout(() => {
                output.log("Cooldown complete.")
                setInterval(checkChannelName, 2000)
            }, 1000)
        }
        else setInterval(checkChannelName, 2000)
    }, 2000)

    output.log('Monitoring channel change')
})()