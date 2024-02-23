/*:
 * @target MZ
 * @plugindesc Random Event Placement Plugin for RPG Maker MZ
 * @StarryBei
 * @command changeImage
 * 
 * @arg eventId
 * @text Event ID
 * @desc The ID of the event to change the image for.
 * @type number
 * @default 1
 
 * @arg imageList
 * @text Image List
 * @desc A list of image filenames to choose from (e.g., ["Actor1", "Actor2"]).
 * @type text[]
 * @default ["Actor1","Actor2","Actor3"]
 *
 * @help RandomEventPlacement.js
 *
 * This plugin randomly changes the image of a selected event on the current map.
 */

(() => {
    const pluginName = 'RandomEventPlacement';

    // 注册插件命令
    PluginManager.registerCommand(pluginName, 'changeImage', args => {
        const eventId = Number(args.eventId);
        const imageList = JSON.parse(args.imageList);
        changeEventImage(eventId, imageList);
    });

    // 函数用于随机更改事件图像
    function changeEventImage(eventId, imageList) {
        const event = $gameMap.event(eventId);
        if (event) {
            const randomIndex = Math.floor(Math.random() * imageList.length);
            const imageName = imageList[randomIndex];
            const imageIndex = 0; // 如果你的素材有多个图像在同一文件中，这里可以更改索引
            event.setImage(imageName, imageIndex);
        }
    }

    // 插件命令：随机更改指定事件的图像
    PluginManager.registerCommand(pluginName, 'changeImage', args => {
        const eventId = Number(args.eventId);
        const imageList = JSON.parse(args.imageList);
        changeEventImage(eventId, imageList);
    });

})();
