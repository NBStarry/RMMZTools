// --------------------------------------------------------------------------------------
// 
// ChatGPT_APIMZCN.js v1.3
//
// Copyright (c) kotonoha*（https://aokikotori.com/）
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//
// 2023/04/13 ver1.0 测试版插件发布
// 2023/05/01 ver1.09 规范更正。
// 加速了消息窗口的显示时序。
// 修复了一个错误，即从保存的数据重新启动时，memory_talk 中的第一个对话没有响应。
// 2023/05/05 ver1.10 规范更正。
// 修正了一个 Bug，当超过 -memory_talk 中设置的次数时，系统角色会被删除。
// 2023/05/06 ver1.11 规范修正。
// 修正了一个错误，即不使用 memory_talk 的响应不会输入变量。
// 调整了等待应答时的处理方式。
// 添加了 2023/05/09 ver1.2 规范。
// 允许在插件参数中设置自定义字体。
// 允许在插件命令中设置字符名称、表面图形和索引。
// 2023/05/09 ver1.21 紧急修复。
// - 修复了等待模式的控制问题。
// 2023/05/10 ver1.22 规范修正。
// 等待模式控制再次调整。
// -如果已执行的事件有一个固定的方向，现在它将在完成后返回到原来的方向。
// 2023/05/11 ver1.23 规范更正。
// 错误信息输出改为日文。
// 2023/05/14 ver1.24 规范更正。
// 修正了并行处理事件时发生错误的问题。
// 2023/05/15 ver1.3 规范新增。
// 现在可以通过参数设置应答窗口的设计。
//
// --------------------------------------------------------------------------------------
/*:
 * @target MZ
 * @plugindesc ChatGPT 插件，通过 API 与 ChatGPT 通信并创建对话。
 * @author kotonoha*
 * @url https://github.com/kotonoha0109/kotonoha_tkoolMZ_Plugins/blob/main/plugins/ChatGPT_APIMZ.js
 *
 * @param ChatGPT_Model
 * @type string
 * @default gpt-3.5-turbo
 * @desc ChatGPT 的人工智能模型
 *
 * @param ChatGPT_URL
 * @type string
 * @default https://api.openai.com/v1/chat/completions
 * @desc ChatGPT 的 URL
 * 如果使用服务器端，文件的 URL。
 *
 * @param ChatGPT_APIkey
 * @type string
 * @default sk-
 * @desc ChatGPT API 密钥（数字为变量 ID，字符串为 API 密钥）
 * API 密钥可以存储在变量中。
 *
 * @param UserMessageVarId
 * @type variable
 * @default 1
 * @desc 用于存储玩家问题的变量 ID。
 *
 * @param AnswerMessageVarId
 * @type variable
 * @default 2
 * @desc 用于存储人工智能答案的变量 ID
 *
 * @param MemoryMessageVarId
 * @type variable
 * @default 3
 * @desc 用于存储回复历史记录的变量 ID
 *
 * @param VisibleSwitchID
 * @type switch
 * @default 
 * @desc 切换 ID 隐藏答案。
 * 当您不想显示答案，只想将其存储在变量中时。
 *
 * @param BrStr
 * @type boolean
 * @default true
 * @desc 自动换行
 * 在响应中输出换行代码时处理换行符。
 *
 * @param ReplaceStr
 * @type string
 * @default 
 * @desc NG 字符
 * 一次只判断一个字符。例如，如果您写""，括号会被隐藏。
 *
 * @param SystemMessage
 * @type multiline_string
 * @default Please answer in Chinese.
 * @desc 向人工智能发出的常用指令（例如 "用中文回答 "或 "用 120 个字符或更少的文字进行总结"）。
 *
 * @param FontFileName
 * @desc 指定要使用的字体的文件名。
 * 请包括至扩展名。
 * @type string
 * @default 
 * 
 * @param Layouts
 * @type struct<Layout>[]
 * @desc 定义窗口设计。
 * LayoutVariableId 的值用于切换显示的窗口。
 * 
 * @param LayoutVariableId
 * @type variable
 * @desc 用于切换窗口设计的变量 ID
 * @default 0
 * 
 * @command chat
 * @text Send Chat Message
 * @desc 向 API 发起查询的命令
 *
 * @arg system
 * @type multiline_string
 * @default 
 * @desc 此事件的指示
 *
 * @arg message
 * @type multiline_string
 * @default 
 * @desc 此事件的问题 ※CuatomQuestionMessageVarId 为 0 或变量为空时，此问题将被反映。
 *
 * @arg message_before
 * @type multiline_string
 * @default 
 * @desc 问题前附加的内容
 * 输入补充事项时使用。
 * 
 * @arg message_after
 * @type multiline_string
 * @default
 * @desc 问题后附加的内容
 * 输入补充事项时使用。
 * 
 * @arg displayHeader
 * @type string
 * @default
 * @desc 在答案前显示的内容
 * 输入 userMessage 会替换为问题（message）。
 * 
 * @arg temperature
 * @type Number
 * @default 1
 * @desc 采样温度（0～1）
 * 值越低相关性越高，值越高生成的单词越多样
 *
 * @arg top_p
 * @type Number
 * @default 0.9
 * @desc 文章的多样性（0～1）
 * 值越低一致性提高，值越高文章越多样
 *
 * @arg max_tokens
 * @type Number
 * @default 512
 * @desc AI 回答的最大 token 数（gpt-3.5-turbo 最高 4096）
 * 中文 1 字符约等于 2～3 个 token
 *
 * @arg memory_talk
 * @type Number
 * @default 10
 * @desc 会话历史记录的保存量
 * AI 记忆的会话数量（1 次问题 + 回答算作 1）
 *
 * @arg CuatomQuestionMessageVarId
 * @type variable
 * @default
 * @desc 存储此事件问题的变量 ID
 * 如果为空，则使用插件参数的设置。
 *
 * @arg CustomAnswerMessageVarId
 * @type variable
 * @default
 * @desc 存储此事件答案的变量 ID
 * 如果为空，则使用插件参数的设置。
 *
 * @arg CustomMemoryMessageVarId
 * @type variable
 * @default
 * @desc 存储此事件历史记录的变量 ID
 *
 * @arg support_message
 * @type multiline_string
 * @default
 * @desc 支持问题
 * 创建此事件的问题示例。
 * 
 * @arg support_answer
 * @type multiline_string
 * @default
 * @desc 支持回答
 * 创建对支持问题的回答示例。
 * 
 * @arg characterName
 * @type string
 * @default
 * @desc 角色名称
 * 在消息窗口上显示。
 * 
 * @arg faceImage
 * @type file
 * @default
 * @desc 角色的脸部图形
 * 如果不显示，请留空。
 * @dir img/faces/
 * 
 * @arg faceIndex
 * @type number
 * @default
 * @desc 脸部图形的索引
 * 根据 MZ 的规范，左上角是 0～3，右下角是 4～7。
 *
 * @help 该插件通过与 ChatGPT API 通信，让 AI 创建对话。
 * 需要设置自己的 API 密钥。
 *
 * 【注意】
 * API 密钥必须由游戏玩家拥有，请勿在作品中注册后公开！
 * 如果作者的 API 密钥泄露，将由作者自行承担责任！
 * 请自行负责 API 密钥泄露或使用费用相关的问题！
 * 
 * 【基本使用方法】
 * (1) 请将在 OpenAI 获取的 API 密钥设置在 ChatGPT_APIkey 中。
 *
 * (2) 至少需要 3 个空闲变量 ID。
 * ・将玩家的问题临时存储在变量中。
 *   请将空闲的变量 ID 设置在参数 UserMessageVarId 中。
 * ・将 AI 的回答临时存储在变量中。
 *   请将空闲的变量 ID 设置在参数 AnswerMessageVarId 中。
 * ・将回答历史临时存储在变量中。
 *   请将空闲的变量 ID 设置在参数 MemoryMessageVarId 中。
 *
 * (3) 在希望 AI 创建对话的事件中，通过插件命令选择「ChatGPT_APIMZCN」，
 * 并注册角色设置。
 * 
 * 【插件命令解释】
 * # system
 * 此事件的指示。它将附加到插件参数 SystemMessage 中，
 * 因此您可以在此事件中给出补充指示。
 * 例如，如果参数设置为「请用中文回答」，则在此事件中可以补充指示「但是，请用繁体中文回答」。
 *
 * # message
 * 此事件的问题。请输入您希望 AI 回答的问题。
 * 但是，如果您使用变量 CuatomQuestionMessageVarId 来输入问题，请将此项留空。
 * 
 * # message_before, message_after
 * 使用变量作为事件问题时，message 会被变量值替换。
 * 在 GPT-3 模型中，system 中记录的内容不会被重视，如果不遵循命令，请尝试在这里输入。
 * 在变量前后设置 message 角色的字符串。
 * 例如，如果变量值为「你好」，message_before 为「你是」，message_after 为「吗？」，
 * 则 AI 会被问到「你是你好吗？」。
 * 
 * # displayHeader
 * 在消息窗口中显示的头部。如果要显示变量 ID 1 的值，请输入 \V[1]。
 * 此外，输入 userMessage 将显示除 message_before 和 message_after 之外的问题。
 * 
 * # temperature, top_p
 * 分别决定 AI 回答的多样性的数值。
 * 请设置 0～1 的数值。
 * 
 * # max_tokens
 * 设置最大 token 数（中文 1 字符约等于 2～3 个 token）。
 * 可以决定字符数上限，但如果响应的字符数低于最大 token 数，文章会在中途被截断。
 *
 * # memory_talk
 * 历史记录的数量。保存数值的交互。
 * 如果设置的数值为 5，则保存最近 5 次的交互。
 * 越多越能进行符合话题的对话，但由于历史记录中的 token 会被发送到 API，可能会导致使用费用增加。
 * 如果不需要保存，请设置为 0。
 *
 * # CuatomQuestionMessageVarId
 * 存储此事件问题的变量 ID。
 * 如果使用名称输入窗口或聊天窗口输入问题，并且问题已保存在变量中，请指定该变量 ID。
 * ※如果同时设置了此变量和 message，则 message 优先。
 * ※与插件参数 UserMessageVarId 不同。
 *
 * # CustomAnswerMessageVarId
 * 存储此事件答案的变量 ID。
 * 保存在插件参数 AnswerMessageVarId 中，但如果您希望单独记录每个事件的答案，请指定此变量 ID。
 *
 * # CustomMemoryMessageVarId
 * 存储此事件历史记录的变量 ID。
 * 由于记录在 API 通信中的数组，因此无法直接调用。
 * 如果想手动删除历史记录，请将此变量 ID 的变量清空。
 * 
 * # support_message, support_answer
 * 创建对话示例。
 * AI 在回答时会参考这些示例。
 * 如果 support_message 输入「自我介绍」，support_answer 输入「我是暹罗猫！5 岁喵！」，
 * 则输入这些后，下一次对话 AI 会参考 support_answer 的示例，更容易使用「我」作为第一人称，并在句尾加上「喵！」。
 * 
 * # characterName, faceName, faceIndex
 * 设置角色名称、脸部图形及其显示索引。
 * 请在 img/faces/ 中输入脸部图形的文件名。
 * 如果不显示脸部图形，请留空。
 * 索引设置脸部图形的左边第几个。
 * 第一行是 0～3，第二行是 4～7。
 * 
 * 【关于浏览器版的操作】
 * 本插件生成的消息窗口使用 HTML。
 * 在 Web 浏览器中播放时，消息窗口可能会大幅突出游戏区域。
 * 在这种情况下，请另外准备包含 iframe 的 HTML，并在其中加载由制作工具生成的 index.html。
 * 
 * 【自定义消息窗口】
 * 如果您想自定义消息窗口的宽度、高度、位置和背景色，请修改 function createStreamingTextElement() 的内容。
 * 请使用窗口调整工具。
 * ▼窗口调整工具
 * https://aokikotori.com/chatgpt_apimz_window/
 * 
 * 【与服务器端的协作】
 * 可以在服务器上设置 PHP 或 Python 等文件，并将 ChatGPT 请求头等保密。
 * ▼PHP 示例在这里
 * https://github.com/kotonoha0109/kotonoha_tkoolMZ_Plugins/blob/main/plugins/php/request.php
 * 
 * 在 PHP 文件中设置 API 密钥并上传到服务器后，
 * 请将插件参数 ChatGPT_URL 设置为 PHP 文件的 URL。
 * 请务必删除插件参数 ChatGPT_APIkey。请务必删除。
 */

/*~struct~Layout:
 *
 * @param template
 * @text 模板
 * @desc 选择窗口模板。
 * design1～3 是模板，custom 是用户设置。
 * @type select
 * @option custom
 * @option design1
 * @option design2
 * @option design3
 * @default custom
 * 
 * @param color
 * @text 文本颜色
 * @desc 窗口内文本的颜色。
 * @default white
 * 
 * @param fontSize
 * @text 字体大小
 * @desc 窗口内文本的字体大小。
 * @default 22px
 *
 * @param padding
 * @text 填充
 * @desc 窗口内文本的填充。
 * @default 16px
 * 
 * @param background
 * @text 背景
 * @desc 窗口背景。可以指定颜色或渐变。
 * @default linear-gradient(to bottom, rgba(15,28,69,0.8), rgba(8,59,112,0.8))
 *
 * @param boxShadow
 * @text 阴影
 * @desc 窗口阴影。
 * @default 
 * 
 * @param margin
 * @text 边距
 * @desc 窗口边距。
 * @default 0 8px
 * 
 * @param borderColor
 * @text 边框颜色
 * @desc 窗口边框颜色。
 * @default white
 *
 * @param borderWidth
 * @text 边框宽度
 * @desc 窗口边框宽度。
 * @default 2px
 * 
 * @param borderStyle
 * @text 边框样式
 * @desc 窗口边框样式。
 * @default solid
 * 
 * @param borderRadius
 * @text 边框圆角
 * @desc 窗口边框圆角。
 * @default 5px
 * 
 */

(() => {

	const pluginParameters = PluginManager.parameters('ChatGPT_APIMZCN');
	const userMessageVarId = Number(pluginParameters['UserMessageVarId']) || 1;
	const answerMessageVarId = Number(pluginParameters['AnswerMessageVarId']) || 2;
	const memoryMessageVarId = Number(pluginParameters['MemoryMessageVarId']) || 3;
	const visibleSwitchID = Number(pluginParameters['VisibleSwitchID']) || null;
	const replacestr = String(pluginParameters['ReplaceStr']) || "";
	const brstr = pluginParameters['BrStr'] === 'true' || pluginParameters['BrStr'] === true;
	const systemMessage = String(pluginParameters['SystemMessage']) || "Please answer in Japanese.";
	const fontFileName = pluginParameters['FontFileName'] || '';
	const layouts = JSON.parse(pluginParameters['Layouts']).map(layout => JSON.parse(layout));
	const layoutVariableId = Number(pluginParameters['LayoutVariableId']);

	let previousMessage = null;
	let isDoneReceived = false;
	let isFontLoaded = false;

	// 设置自定义字体
	if (fontFileName && fontFileName.trim() !== '') {
		const _Scene_Boot_loadGameFonts = Scene_Boot.prototype.loadGameFonts;
		Scene_Boot.prototype.loadGameFonts = function () {
			_Scene_Boot_loadGameFonts.call(this);
			FontManager.load('customFont', fontFileName);
		};
		const font = new FontFace('customFont', 'url("./fonts/' + fontFileName + '")');
		document.fonts.add(font);
		font.load().then(() => {
			addCustomFontStyle();
		}).catch((error) => {
			console.error('无法加载字体：', error);
		});
	}

	PluginManager.registerCommand("ChatGPT_APIMZCN", "chat", async (args) => {

		// 初始化窗口
		console.log('ChatGPT_APIMZCN: chat command called');
		updateStreamingTextElement();
		isDoneReceived = false;

		const temperature = Number(args.temperature) || 1;
		const top_p = Number(args.top_p) || 0.9;
		const max_tokens = Number(args.max_tokens) || 512;
		const customQuestionMessageVarId = Number(args.CuatomQuestionMessageVarId) || null;
		const customAnswerMessageVarId = Number(args.CustomAnswerMessageVarId) || null;

		let targetVarId = customQuestionMessageVarId !== null ? customQuestionMessageVarId : 0;
		let variableValue = $gameVariables.value(targetVarId);
		let userMessage;
		let displayHeader;
		let support_message;
		let support_answer;
		let faceImage = args.faceImage !== undefined ? String(args.faceImage) : null;
		let faceIndex = Number(args.faceIndex) || 0;
		let characterName = String(args.characterName) || '';

		// 如果变量 ID 未定义，则问题反映 MESSAGE
		if (targetVarId !== 0 && !variableValue) {
			if (!args.message || args.message === '') { return; }
			if (!args.message_before) { args.message_before = ''; }
			if (!args.message_after) { args.message_after = ''; }
			userMessage = args.message_before + args.message + args.message_after;
			userMessage_input = args.message;
		} else if (targetVarId === 0 && (!args.message || args.message === '')) {
			// 如果变量和信息都不是空的，则退出进程。
			return;
		} else {
			// 否则，变量 customQuestionMessageVarId 将反映在问题中。
			if (!args.message_before) { args.message_before = ''; }
			if (!args.message_after) { args.message_after = ''; }
			userMessage = variableValue ? args.message_before + variableValue + args.message_after : args.message_before + args.message + args.message_after;
			userMessage_input = variableValue ? variableValue : args.message;
		}

		// 过程控制字符
		userMessage = processControlCharacters(userMessage);
		$gameVariables.setValue(targetVarId, userMessage);

		if (userMessageVarId !== null) {
			$gameVariables.setValue(userMessageVarId, userMessage);
		}

		const customMemoryMessageVarId = Number(args.CustomMemoryMessageVarId) || memoryMessageVarId;
		let customMemoryMessage = $gameVariables.value(customMemoryMessageVarId);

		// 非记忆性过程
		if (Number(args.CustomMemoryMessageVarId) === 0 || !args.memory_talk) {
			$gameVariables.setValue(memoryMessageVarId, []);
			previousMessage = "";
			customMemoryMessage = [];
			customMemoryMessage.push({ role: 'system', content: processControlCharacters(systemMessage) });
			// 添加指挥系统角色
			if (args.system) {
				customMemoryMessage.push({ role: 'system', content: (processControlCharacters(args.system) || "") });
			}
			// PUSH 支持问题与支持答案
			if (args.support_message && args.support_answer) {
				customMemoryMessage.push({ role: 'user', content: (processControlCharacters(args.support_message) || "") });
				customMemoryMessage.push({ role: 'assistant', content: (processControlCharacters(args.support_answer) || "") });
			}
			customMemoryMessage.push({ role: 'user', content: userMessage });
			$gameVariables.setValue(memoryMessageVarId, customMemoryMessage);

		} else {
			customMemoryMessage = $gameVariables.value(customMemoryMessageVarId);

			if (!Array.isArray(customMemoryMessage)) {
				customMemoryMessage = [];
				previousMessage = "";
				customMemoryMessage.push({ role: 'system', content: processControlCharacters(systemMessage) });
				// 添加指挥系统角色
				if (args.system) {
					customMemoryMessage.push({ role: 'system', content: (processControlCharacters(args.system) || "") });
				}
				// PUSH 支持问题与支持答案
				if (args.support_message && args.support_answer) {
					customMemoryMessage.push({ role: 'user', content: (processControlCharacters(args.support_message) || "") });
					customMemoryMessage.push({ role: 'assistant', content: (processControlCharacters(args.support_answer) || "") });
				}
				customMemoryMessage.push({ role: 'user', content: userMessage });

			} else {

				// 记忆对话过程
				const memoryTalk = Number(args.memory_talk) * 2 || 1;
				customMemoryMessage.push({ role: 'user', content: userMessage });

				while (true) {
					let userCount = customMemoryMessage.filter(item => item.role === 'user').length;
					let assistantCount = customMemoryMessage.filter(item => item.role === 'assistant').length;

					if (userCount + assistantCount > memoryTalk) {
						let userIndex = customMemoryMessage.findIndex(item => item.role === 'user');
						let assistantIndex = customMemoryMessage.findIndex(item => item.role === 'assistant');

						if (userIndex >= 0 && assistantIndex >= 0) {
							customMemoryMessage.splice(Math.min(userIndex, assistantIndex), 2);
						} else {
							break;
						}
					} else {
						break;
					}
				}

			}
			$gameVariables.setValue(customMemoryMessageVarId, customMemoryMessage);
		}

		const streamingTextElement = document.getElementById('streamingText');
		addCustomFontStyle();
		if ($gameSwitches.value(visibleSwitchID) !== true) {
			streamingTextElement.style.display = 'block';
		}

		streamingTextElement.innerHTML = '';
		//console.log(customMemoryMessage);

		(async () => {

			const ChatGPT_Model = String(pluginParameters['ChatGPT_Model']) || 'gpt-3.5-turbo';
			const ChatGPT_URL = String(pluginParameters['ChatGPT_URL']) || 'https://api.openai.com/v1/chat/completions';

			// 非输出开关关闭时，事件停止
			if ($gameSwitches.value(visibleSwitchID) !== true) {
				$gameMap._interpreter.setWaitMode('waitChatGPT');
				// 事件移动在流式传输过程中停止
				const event = $gameMap.event($gameMap._interpreter.eventId());
				if (event) {
					currentEvent = event;
					event._originalDirectionFix = event.isDirectionFixed();
					event.setDirectionFix(true);
					event._originalMoveType = event._moveType;
					event._moveType = 0;
				}
			}

			// 与 ChatGPT API 通信
			const url = ChatGPT_URL;

			try {

				const response = await fetch(url, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': 'Bearer ' + getChatGPT_APIkey(),
					},
					body: JSON.stringify({
						model: ChatGPT_Model,
						temperature: temperature,
						top_p: top_p,
						max_tokens: max_tokens,
						stream: true,
						messages: customMemoryMessage,
					}),
				});
				//console.log(customMemoryMessage);

				if (!response.ok) {
					const errorText = await response.text();
					const errorJson = JSON.parse(errorText);
					let errorMessage = String(errorJson.error.message).slice(0, 30);
					// 从应用程序接口输出信息
					console.error('Error:', errorMessage);
					errorMessage = await getJapaneseErrorMessage(errorMessage);
					$gameMessage.add(errorMessage);
					isDoneReceived = true;
					unlockControlsIfNeeded();
					return;
				}

				// 事件执行
				const reader = response.body.getReader();
				const textDecoder = new TextDecoder();
				let buffer = '';
				let streamBuffer = '';
				let textArray = [];

				if (!args.displayHeader) args.displayHeader = "";
				let preMessage = processControlCharacters(args.displayHeader);
				preMessage = preMessage.replace(/userMessage/g, userMessage_input);

				// 配置面部图形
				if (faceImage !== null && faceImage !== "") {
					if (!faceIndex) { faceIndex = 0; }
					const faceWidth = 144;
					const faceHeight = 144;
					const facesPerRow = 4;
					const facesPerCol = 2;
					const faceX = faceWidth * (faceIndex % facesPerRow);
					const faceY = faceHeight * Math.floor(faceIndex / facesPerRow);
					const faceImageUrl = '<img src="img/faces/' + faceImage + '.png" style="object-fit: none; object-position: -' + faceX + 'px -' + faceY + 'px; width: ' + faceWidth + 'px; height: ' + faceHeight + 'px; float: left; margin-right: 20px;">';
					textArray = [preMessage, faceImageUrl];
				} else {
					textArray = [preMessage];
				}

				// 设置字符名称
				if (args.characterName) {
					textArray.push(processControlCharacters(args.characterName) + "<br>");
				}

				// 与 ChatGPT 的交流
				while (true) {

					const { value, done } = await reader.read();
					if (done) { break; }
					buffer += textDecoder.decode(value, { stream: true });

					let newlineIndex;

					do {

						newlineIndex = buffer.indexOf('\n');
						if (newlineIndex === -1) { break; }
						const line = buffer.slice(0, newlineIndex);
						buffer = buffer.slice(newlineIndex + 1);

						if (line.startsWith('data:')) {

							// 当到达流式文本的末尾时，重新开始事件
							if (line.includes('[DONE]')) {
								previousMessage = streamBuffer;
								// 将回答赋值给变量ID
								let targetAnswerVarId = customAnswerMessageVarId !== null ? customAnswerMessageVarId : answerMessageVarId;
								// 将回答赋给助手角色
								customMemoryMessage.push({ role: 'assistant', content: previousMessage });
								$gameVariables.setValue(targetAnswerVarId, previousMessage);
								// 重新开始事件
								isDoneReceived = true;
								return;
							}

							const jsonData = JSON.parse(line.slice(5));

							// 显示流式文本
							if (jsonData.choices && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {

								let assistantMessage = jsonData.choices[0].delta.content;

								// 将助手消息作为流缓冲区单独保存
								streamBuffer += assistantMessage;

								// 将换行符转换为<br>
								if (brstr === true) { assistantMessage = assistantMessage.replace(/\n/g, "<br>"); }
								assistantMessage = removeChars(assistantMessage, replacestr);

								// 输出
								textArray.push(assistantMessage);
								const combinedText = textArray.join('');
								const processedText = processControlCharacters(combinedText);
								streamingTextElement.innerHTML = processedText;
								//console.log(textArray);

								// 根据输出调整滚动
								setTimeout(() => {
									streamingTextElement.scrollTop = streamingTextElement.scrollHeight;
								}, 0);

							}
						}
					} while (newlineIndex !== -1);
				}

			} catch (error) {
				console.error('Error:', error);
				let errorMessage = error;
				errorMessage = await getJapaneseErrorMessage(errorMessage);
				$gameMessage.add(errorMessage);
				isDoneReceived = true;
				unlockControlsIfNeeded();
				return;
			}

		})();

	});

	// 获取 API 密钥
	function getChatGPT_APIkey() {
		const APIKey = String(pluginParameters['ChatGPT_APIkey']) || 'sk-';
		const apiKeyVarId = parseInt(APIKey, 10);
		if (Number.isInteger(apiKeyVarId) && $gameVariables && $gameVariables.value(apiKeyVarId)) {
			return $gameVariables.value(apiKeyVarId);
		} else {
			return APIKey;
		}
	}

	// 移除 NG 字符
	const removeChars = (str, chars) => {
		const escapeRegExp = (str) => {
			return str.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
		};
		const escapedChars = escapeRegExp(chars);
		const regex = new RegExp(`[${escapedChars}]`, 'g');
		return str.replace(regex, '');
	}

	// 处理控制字符
	function processControlCharacters(str) {
		return str.replace(/\\([VNPI])\[(\d+)\]|\\G/g, function (matchedString, type, id) {
			if (matchedString === '\\G') {
				return TextManager.currencyUnit;
			}
			const numId = Number(id);
			switch (type) {
				case 'V':
					return String($gameVariables.value(numId));
				case 'N':
					return String($gameActors.actor(numId).name());
				case 'P':
					return String($gameParty.members()[numId - 1].name());
				default:
					return '';
			}
		});
	}

	// 设置自定义字体样式
	function addCustomFontStyle() {
		if (!isFontLoaded) {
			const style = document.createElement('style');
			style.textContent = `#streamingText {font-family: 'customFont';}`;
			document.head.appendChild(style);
			isFontLoaded = true;
		}
	}

	// 实现等待模式
	const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
	Game_Interpreter.prototype.updateWaitMode = function () {
		if (this._waitMode === "waitChatGPT") {
			const streamingTextElement = document.getElementById("streamingText");

			if (!streamingTextElement) {
				$gameMap._interpreter.setWaitMode('');
				if (typeof currentEvent !== 'undefined' && currentEvent) {
					currentEvent.setDirectionFix(currentEvent._originalDirectionFix);
					currentEvent._moveType = currentEvent._originalMoveType;
					currentEvent = null;
				}
				isDoneReceived = true;
				return false;
			}
			return true;
		}
		return _Game_Interpreter_updateWaitMode.call(this);
	};

	// 控制窗口的滚动和开关
	const scrollSpeed = 30; // 用于调整滚动速度的常量
	const _Scene_Map_update = Scene_Map.prototype.update;
	Scene_Map.prototype.update = function () {
		_Scene_Map_update.call(this);
		if (streamingTextElement && streamingTextElement.style.display !== "none") {
			if (Input.isPressed("up")) {
				streamingTextElement.scrollTop -= scrollSpeed;
			} else if (Input.isPressed("down")) {
				streamingTextElement.scrollTop += scrollSpeed;
			}
			if ((Input.isTriggered("ok") || Input.isTriggered("cancel") || TouchInput.isCancelled()) && isScrollAtEnd(streamingTextElement)) {
				unlockControlsIfNeeded();
			} else {
				if (Input.isTriggered("ok") || Input.isTriggered("cancel") || TouchInput.isCancelled()) {
					streamingTextElement.scrollTop = streamingTextElement.scrollHeight;
				}
			}
		}
	};

	const _Game_Map_isEventRunning = Game_Map.prototype.isEventRunning;
	Game_Map.prototype.isEventRunning = function () {
		const isElementVisible = streamingTextElement && streamingTextElement.style.display !== "none";
		return _Game_Map_isEventRunning.call(this) || isElementVisible;
	};

	function isScrollAtEnd(element) {
		return element.scrollTop + element.clientHeight >= element.scrollHeight;
	}

	// 事件恢复处理
	function unlockControlsIfNeeded() {
		if (isDoneReceived && streamingTextElement.scrollHeight - streamingTextElement.clientHeight <= streamingTextElement.scrollTop + 1) {
			streamingTextElement.style.display = 'none';
			streamingTextElement.innerHTML = '';
			if (typeof currentEvent !== 'undefined' && currentEvent) {
				currentEvent.setDirectionFix(currentEvent._originalDirectionFix);
				currentEvent._moveType = currentEvent._originalMoveType;
				currentEvent = null;
			}
			$gameMap._interpreter.setWaitMode('');
			isDoneReceived = true;
		}
	}

	// 错误输出
	async function getJapaneseErrorMessage(errorMessage) {
		if (errorMessage.includes("That model is currently")) {
			return "由于服务器拥塞，我们无法生成回复。";
		} else if (errorMessage.includes("You exceeded your current quota")) {
			return "超出 API 限制。";
		} else if (errorMessage.includes("Incorrect API key provided")) {
			return "API 密钥有误。 请输入正确的 API 密钥。";
		} else {
			return errorMessage;
		}
	}

	// 生成流式文本窗口
	function createStreamingTextElement() {
		const windowHeight = window.innerHeight;
		const streamingTextHeight = 200;
		streamingTextElement = document.createElement('div');
		streamingTextElement.id = 'streamingText';
		streamingTextElement.style.display = 'none';
		streamingTextElement.style.position = 'fixed';
		streamingTextElement.style.zIndex = 100;
		streamingTextElement.style.left = '0';
		streamingTextElement.style.width = '800px';
		streamingTextElement.style.top = `${windowHeight - streamingTextHeight - 16}px`;
		streamingTextElement.style.boxSizing = 'border-box';
		streamingTextElement.style.boxShadow = '';
		streamingTextElement.style.height = '200px';
		streamingTextElement.style.color = 'white';
		streamingTextElement.style.fontSize = '22px';
		streamingTextElement.style.padding = '16px';
		streamingTextElement.style.background = 'linear-gradient(to bottom, rgba(15,28,69,0.8), rgba(8,59,112,0.8))';
		streamingTextElement.style.margin = '0 8px';
		streamingTextElement.style.borderWidth = '2px';
		streamingTextElement.style.borderStyle = 'solid';
		streamingTextElement.style.borderColor = 'white';
		streamingTextElement.style.borderRadius = '5px';
		streamingTextElement.style.overflowY = 'auto';
		applyLayout();
		document.body.appendChild(streamingTextElement);

	}
	createStreamingTextElement();

	// 调整消息窗口以适应屏幕大小变化
	function updateStreamingTextElement() {

		// 获取工具的当前屏幕尺寸和浏览器的屏幕尺寸。
		const canvasWidth = Graphics.width;
		const canvasHeight = Graphics.height;
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;
		const scaleX = windowWidth / canvasWidth;
		const scaleY = windowHeight / canvasHeight;
		const scale = Math.min(scaleX, scaleY);
		const adjustedWidth = canvasWidth * scale;
		const adjustedHeight = canvasHeight * scale;

		// 调整信息窗口的宽度和高度，以适应屏幕尺寸
		let streamingTextHeight = Math.min(200 * scale, 250);
		streamingTextElement.style.width = `${adjustedWidth - 16}px`;
		streamingTextElement.style.height = `${streamingTextHeight}px`;

		// 调整字体大小以适应屏幕尺寸
		let limitedFontSize = Math.min(Math.max(22 * scale, 16), 28);
		streamingTextElement.style.fontSize = `${limitedFontSize}px`;

		// 调整信息窗口的位置以适应屏幕大小
		const topPosition = (windowHeight - adjustedHeight) / 2 + adjustedHeight - streamingTextHeight - 16 * scaleY;
		streamingTextElement.style.top = `${topPosition}px`;
		streamingTextElement.style.left = `${(windowWidth - adjustedWidth) / 2}px`;
		applyLayout();

	}

	// 检查大小调整
	window.addEventListener('resize', () => {
		updateStreamingTextElement();
	});

	// 创建布局模板
	function applyLayout() {
		if (streamingTextElement && $gameVariables) {
			const layoutIndex = $gameVariables.value(layoutVariableId);
			if (layoutIndex >= 1 && layoutIndex <= layouts.length) {
				const layout = layouts[layoutIndex - 1];

				let template;
				switch (layout.template) {
					case 'design1':
						template = { color: '#FFF', background: 'rgba(0, 0, 0, 0.7)', boxShadow: '0 0 0 3px #6d83bf inset', borderColor: 'rgb(165, 207, 239)', borderWidth: '3px', borderStyle: 'solid', borderRadius: '5px' };
						break;
					case 'design2':
						template = { color: '#FFF', background: '#000', borderColor: '#FFF', borderWidth: '5px', borderStyle: 'solid', borderRadius: '12px' };
						break;
					case 'design3':
						template = {
							color: '#FFF',
							background: 'linear-gradient(180deg, #7b7bd6 0, #7b7bd6 5%,#7373ce 5%, #7373ce 10%,#6b6bc6 10%, #6b6bc6 15%,#6363bd 15%, #6363bd 20%,#5a5ab5 20%, #5a5ab5 25%,#5252ad 25%, #5252ad 30%,#4a4aa5 30%, #4a4aa5 35%,#42429c 35%, #42429c 40%,#393994 40%, #393994 45%,#31318c 45%, #31318c 50%,#292984 50%, #292984 55%,#21217b 55%, #21217b 60%,#181873 60%, #181873 65%,#10106b 65%, #10106b 70%,#080863 70%, #080863 75%,#00005a 75%, #00005a 80%,#000052 80%, #000052 85%,#00004a 85%, #00004a 90%,#000042 90%, #000042 95%,#000039 95%, #000039 100%)',
							borderColor: '#FFF', borderWidth: '6px', borderStyle: 'ridge', borderRadius: '12px'
						};
						break;
					default:
						template = layout;
						break;
				}

				streamingTextElement.style.color = template.color;
				streamingTextElement.style.fontSize = template.fontSize;
				streamingTextElement.style.padding = template.padding;
				streamingTextElement.style.background = template.background;
				streamingTextElement.style.boxShadow = template.boxShadow;
				streamingTextElement.style.margin = template.margin;
				streamingTextElement.style.borderColor = template.borderColor;
				streamingTextElement.style.borderWidth = template.borderWidth;
				streamingTextElement.style.borderStyle = template.borderStyle;
				streamingTextElement.style.borderRadius = template.borderRadius;
			}
		}
	}

})();
