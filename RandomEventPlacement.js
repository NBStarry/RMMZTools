/*:
 * @target MZ
 * @plugindesc Random Event Placement Plugin for RPG Maker MZ
 * @StarryBei
 * @command randomPlacement
 * 
 * @arg regionPlace
 * @text Region Place
 * @desc The region to place the items in.
 * @type number[]
 * @default [0, 0, 0, 0]
 * 
 * @arg items
 * @text Items
 * @desc The list of items to be randomly placed.
 * @type struct<Item>[]
 * @default []
 *
 * @help RandomEventPlacement.js
 *
 * This plugin randomly places items in a specified region when the player enters a room.
 */

/*~struct~Item:
 * @param eventId
 * @text Event ID
 * @desc The ID of the event to change the image for.
 * @type number
 * @default 1
 * 
 * @param image
 * @text Image
 * @desc The image contains tiles to show.
 * @type text
 * @default !Kitchen1
 * 
 * @param imageIdx
 * @text Image Index
 * @desc The index of the image to show.
 * @type number
 * @default 0
 */

(() => {
    const pluginName = 'RandomEventPlacement';

    PluginManager.registerCommand(pluginName, 'randomPlacement', args => {
        const regionPlace = JSON.parse(args.regionPlace).map(Number);
        const items = JSON.parse(args.items);
        randomPlaceItems(regionPlace, items);
    });

    function getRandomNumberFromList(numbers) {
        var randomIndex = Math.floor(Math.random() * numbers.length);
        var randomNumber = numbers[randomIndex];
        return randomNumber;
    }

    function getRandomNumberFromRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 函数用于随机更改事件图像
    function changeEventImage(eventId, image, imageIdx) {
        const event = $gameMap.event(eventId);
        if (event) {
            event.setImage(image, imageIdx);
            event.setDirectionFix(false);
            const direction = getRandomNumberFromList([2, 4, 6, 8]);
            event.setDirection(direction);
            event.setDirectionFix(true);
            event.setStepAnime(true);
            console.log("changeEventImage");
        }
    }

    function changeEventPostion(eventId, x, y) {
        const event = $gameMap.event(eventId);
        if (event) {
            event.setPosition(x, y);
        }
    }

    // 随机摆放物品
    function randomPlaceItems(regionPlace, items) { // regionPlace[x1, x2, y1, y2]
        const availableItems = [...items]
        console.log(regionPlace[0], regionPlace[1], regionPlace[2], regionPlace[3]);
        const width = Math.abs(regionPlace[1] - regionPlace[0]) + 1;
        const height = Math.abs(regionPlace[3] - regionPlace[2]) + 1;
        const placeableCoords = Array(width*height).fill(true)
        availableItems.forEach(item => {
            item = JSON.parse(item);
            const eventId = item.eventId;
            const image = item.image;
            const imageIdx = item.imageIdx;
            changeEventImage(eventId, image, imageIdx);
            let x, y;
            do {
                x = getRandomNumberFromRange(0, width-1);
                y = getRandomNumberFromRange(0, height-1);
                console.log(placeableCoords);
            } while (placeableCoords[x * width + y] === false);
            placeableCoords[x * width + y] = false;
            changeEventPostion(eventId, x + regionPlace[0], y + regionPlace[2]);
        });
    }

    // 插件命令：随机摆放物品
    PluginManager.registerCommand(pluginName, 'randomPlacement', args => {
        const regionPlace = JSON.parse(args.regionPlace).map(Number);
        const items = JSON.parse(args.items);
        randomPlaceItems(regionPlace, items);
    });

})();

