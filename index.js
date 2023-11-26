"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const grammy_1 = require("grammy");
const sharp_1 = __importDefault(require("sharp"));
function initial() {
    return { newStickerSetName: '', stickerPacks: [], type: '', selectedStickerPack: null };
}
const bot = new grammy_1.Bot('xxx'); // <-- поместите токен вашего бота в эту строку
bot.use((0, grammy_1.session)({ initial }));
// Функция для проверки подписки на каналы
function checkSubscription(ctx) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        // Замените 'channelusername' на имя вашего канала
        const member = yield ctx.api.getChatMember('@STR_memes', (_b = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : 1);
        return (member.status === 'member' || member.status === 'creator' || member.status === 'administrator');
    });
}
function getRandomString() {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyzGQWERTTYUIOPASDHGFKCN';
    for (let i = 0; i < 7; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
// Обработка команды /start
bot.command('start', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield checkSubscription(ctx)) {
        // Если пользователь подписан на канал, показываем ему клавиатуру
        const keyboard = new grammy_1.InlineKeyboard()
            .text('Создать стикерпак самостоятельно 🌆', 'create')
            .row()
            .text('Редактировать мои стикерпаки 🌅', 'edit')
            .row()
            .text('Скопировать существующий стикерпак 🌉', 'copy');
        yield ctx.reply('Выберите действие:', { reply_markup: keyboard });
    }
    else {
        // Если пользователь не подписан на канал, просим его подписаться\\
        const keyboard = new grammy_1.InlineKeyboard()
            .url('Подписаться на канал 1 ✅', 'https://t.me/STR_memes')
            .url('Подписаться на канал 2 ✅', 'https://t.me/STR_memes');
        yield ctx.reply('Пожалуйста, подпишитесь на эти каналы, чтобы начать использовать бота:', {
            reply_markup: keyboard,
        });
    }
}));
// Обработка нажатий на кнопки
bot.callbackQuery('create', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield checkSubscription(ctx)) {
        const keyboard = new grammy_1.Keyboard()
            .text('🖼 Обычные')
            .text('🎥 Видео')
            .row()
            .text('➡️Вернуться в меню')
            .resized();
        ctx.reply('Выберете тип стикерпака.', {
            reply_markup: keyboard,
        });
        yield ctx.answerCallbackQuery();
    }
    else {
        ctx.reply('Пожалуйста, подпишитесь на наши каналы, чтобы начать использовать бота.');
    }
}));
bot.hears('➡️Вернуться в меню', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield checkSubscription(ctx)) {
        // Если пользователь подписан на канал, показываем ему клавиатуру
        const keyboard = new grammy_1.InlineKeyboard()
            .text('Создать стикерпак самостоятельно 🌆', 'create')
            .row()
            .text('Редактировать мои стикерпаки 🌅', 'edit')
            .row()
            .text('Скопировать существующий стикерпак 🌉', 'copy');
        yield ctx.reply('Выберите действие:', { reply_markup: keyboard });
    }
    else {
        // Если пользователь не подписан на канал, просим его подписаться\\
        const keyboard = new grammy_1.InlineKeyboard()
            .url('Подписаться на канал 1 ✅', 'https://t.me/STR_memes')
            .url('Подписаться на канал 2 ✅', 'https://t.me/STR_memes');
        yield ctx.reply('Пожалуйста, подпишитесь на эти каналы, чтобы начать использовать бота:', {
            reply_markup: keyboard,
        });
    }
}));
bot.hears('🖼 Обычные', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield checkSubscription(ctx)) {
        ctx.reply('🖼️ Отправь название для нового набора');
        ctx.session.newStickerSetName = 'waiting_for_name';
        ctx.session.type = 'photo';
    }
    else {
        ctx.reply('Пожалуйста, подпишитесь на наши каналы, чтобы начать использовать бота.');
    }
}));
bot.hears('🎥 Видео', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield checkSubscription(ctx)) {
        ctx.reply('🎥 Отправь название для нового набора');
        ctx.session.newStickerSetName = 'waiting_for_name_video';
        ctx.session.type = 'video';
    }
    else {
        ctx.reply('Пожалуйста, подпишитесь на наши каналы, чтобы начать использовать бота.');
    }
}));
bot.on('message:text', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (ctx.session.newStickerSetName === 'waiting_for_name') {
        const stickerName = ctx.message.text; // Создание стикерпака -> выбор названия
        ctx.session.newStickerSetName = stickerName; // Запись названия в сессию
        console.log(ctx.session.stickerPacks);
        yield ctx.reply('Теперь отправьте фотографию для стикерпака.');
    }
    else if (ctx.session.newStickerSetName === 'waiting_for_name_video') {
        const stickerName = ctx.message.text;
        ctx.session.newStickerSetName = stickerName;
        console.log(ctx.session.stickerPacks);
        yield ctx.reply('Теперь отправьте видео для добавления в стикерпак');
    }
    else if (ctx.session.newStickerSetName === 'waiting_for_name_sticker') {
        const stickerName = ctx.message.text; // Создание стикерпака(со стикеров) -> выбор названия
        ctx.session.newStickerSetName = stickerName; // Запись названия в сессию
        console.log(ctx.session.stickerPacks);
        yield ctx.reply('Теперь отправьте стикер из стикерпака, который вы ходите скопировать.');
    }
    else if ((ctx.session.newStickerSetName = 'waiting_for_name_change')) {
        const stickerName = ctx.message.text;
        ctx.session.newStickerSetName = stickerName;
        try {
            console.log(ctx.session.selectedStickerPack);
            console.log(ctx.message.text);
            yield ctx.api.setStickerSetTitle((_a = ctx.session.selectedStickerPack) !== null && _a !== void 0 ? _a : 'MyPack', `${ctx.message.text}_ @ссылканаканал`);
            ctx.session.stickerPacks = (_b = ctx.session.stickerPacks) === null || _b === void 0 ? void 0 : _b.map((el) => {
                if (el.name == ctx.session.selectedStickerPack) {
                    return { title: ctx.message.text, name: el.name };
                }
                else {
                    return el;
                }
            });
            yield ctx.reply(`Название стикерпака изменено на ${ctx.message.text}_ @ссылканаканал`);
            console.log(ctx.session.stickerPacks);
        }
        catch (error) {
            yield ctx.reply(`${error}`);
        }
    }
}));
bot.on('message:sticker', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e, _f, _g;
    try {
        if (ctx.session.newStickerSetName == 'waiting_for_del_sticker_from_set') {
            const stickerId = ctx.message.sticker.file_id;
            try {
                yield ctx.api.deleteStickerFromSet(stickerId);
                yield ctx.reply('Стикер удалён');
                ctx.session.newStickerSetName = 'waiting_for_name';
            }
            catch (error) {
                yield ctx.reply('Стикер, который вы хотите удалить, не содержиться в наборе');
            } // удаление стикера из набора
        }
        else if (ctx.session.newStickerSetName == 'waiting_for_add_sticker_to_set') {
            const stickerSet = yield ctx.api.getStickerSet((_c = ctx.session.selectedStickerPack) !== null && _c !== void 0 ? _c : '');
            const stickerId = ctx.message.sticker.file_id;
            console.log(stickerSet);
            console.log(ctx.message.sticker);
            const stickerType = ctx.message.sticker.is_video;
            if (!stickerType && !stickerSet.is_video) {
                const stickerId = ctx.message.sticker.file_id;
                yield ctx.api.addStickerToSet(ctx.from.id, (_d = ctx.session.selectedStickerPack) !== null && _d !== void 0 ? _d : '', {
                    sticker: stickerId,
                    emoji_list: ['🙂'],
                });
                yield ctx.reply('Стикер добавлен ');
                ctx.session.newStickerSetName = 'waiting_for_name';
            }
            else if (stickerType && stickerSet.is_video) {
                const stickerId = ctx.message.sticker.file_id;
                yield ctx.api.addStickerToSet(ctx.from.id, (_e = ctx.session.selectedStickerPack) !== null && _e !== void 0 ? _e : '', {
                    sticker: stickerId,
                    emoji_list: ['🙂'],
                });
                yield ctx.reply('Стикер добавлен ');
                ctx.session.newStickerSetName = 'waiting_for_name';
            }
            else {
                yield ctx.reply('Тип стикера не сответствует типу стикерпака');
            }
        }
        else if (ctx.session.newStickerSetName &&
            ctx.session.newStickerSetName != 'waiting_for_name') {
            const sticker = ctx.message.sticker.set_name;
            const stickerSet = yield ctx.api.getStickerSet(`${sticker}`);
            const length = stickerSet.stickers.length;
            if (length > 50) {
                yield ctx.reply('Слишком много стикеров в стикерпаке!');
                return;
            }
            let stickerSetForNewPack = [];
            for (let i = 0; i < length; i++) {
                // Загрузите файл стикера, если это видео-стикер
                if (stickerSet.stickers[i].is_video) {
                    yield ctx.reply('Видео стикеры - не поддерживаются');
                }
                else {
                    stickerSetForNewPack.push({
                        sticker: stickerSet.stickers[i].file_id,
                        emoji_list: [(_f = stickerSet.stickers[i].emoji) !== null && _f !== void 0 ? _f : ''],
                        is_video: stickerSet.is_video,
                    });
                }
            }
            console.log(stickerSet);
            console.log(stickerSetForNewPack);
            const name = `${getRandomString()}_by_${bot.botInfo.username}`;
            console.log(name);
            yield ctx.api.createNewStickerSet(ctx.from.id, name, `${ctx.session.newStickerSetName}_ @ссылканаканал`, stickerSetForNewPack, stickerSet.is_video ? 'video' : stickerSet.is_animated ? 'animated' : 'static');
            const userLocalStickerSet = yield ctx.api.getStickerSet(name);
            ctx.api.sendSticker(ctx.chat.id, userLocalStickerSet.stickers[0].file_id);
            (_g = ctx.session.stickerPacks) === null || _g === void 0 ? void 0 : _g.push({ title: ctx.session.newStickerSetName, name: name });
            console.log(ctx.session.stickerPacks);
            ctx.session.newStickerSetName = 'waiting_for_name';
        }
        else {
            yield ctx.reply('Вы не ввели название для нового стикерпака');
        }
    }
    catch (error) {
        yield ctx.reply(`${error}`);
    }
}));
bot.on('message:photo', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _h, _j, _k, _l, _m, _o;
    if (ctx.session.newStickerSetName == 'waiting_for_add_sticker_to_set') {
        // Получаем файловый ID фотографии
        const fileId = (_h = ctx.message) === null || _h === void 0 ? void 0 : _h.photo[((_j = ctx.message) === null || _j === void 0 ? void 0 : _j.photo.length) - 1].file_id;
        try {
            // Получаем информацию о файле
            const file = yield ctx.api.getFile(fileId !== null && fileId !== void 0 ? fileId : '');
            // Составляем URL для файла
            const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
            // Скачиваем фотографию
            const response = yield axios_1.default.get(fileUrl, { responseType: 'arraybuffer' });
            // Изменяем размер фотографии до 512x512 с помощью sharp
            const resizedPhoto = yield (0, sharp_1.default)(response.data)
                .resize(512, 512, { fit: 'contain', position: 'center' })
                .toBuffer();
            const stickerFile = new grammy_1.InputFile(resizedPhoto, 'sticker.png');
            yield ctx.api.addStickerToSet(ctx.from.id, (_k = ctx.session.selectedStickerPack) !== null && _k !== void 0 ? _k : '', {
                sticker: stickerFile,
                emoji_list: ['🙂'],
            });
            // Отправляем стикер пользователю
            yield ctx.reply('Стикер добавлен');
        }
        catch (error) {
            console.error(error);
        }
    }
    else if (ctx.session.newStickerSetName) {
        const fileId = (_l = ctx.message) === null || _l === void 0 ? void 0 : _l.photo[((_m = ctx.message) === null || _m === void 0 ? void 0 : _m.photo.length) - 1].file_id;
        // Составляем URL для файла
        const file = yield ctx.api.getFile(fileId !== null && fileId !== void 0 ? fileId : '');
        const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
        // Скачиваем фотографию
        const response = yield axios_1.default.get(fileUrl, { responseType: 'arraybuffer' });
        // Изменяем размер фотографии до 512x512 с помощью sharp
        const resizedPhoto = yield (0, sharp_1.default)(response.data).resize(512, 512).toBuffer();
        const stickerFile = new grammy_1.InputFile(resizedPhoto, 'sticker.png');
        const sticker = {
            sticker: stickerFile,
            emoji_list: ['🙂'],
        };
        const name = `${getRandomString()}_by_${bot.botInfo.username}`;
        yield ctx.api.createNewStickerSet(ctx.from.id, name, `${ctx.session.newStickerSetName}_ @ссылканаканал`, [sticker], 'static');
        (_o = ctx.session.stickerPacks) === null || _o === void 0 ? void 0 : _o.push({
            name: name,
            title: ctx.session.newStickerSetName,
        });
        const userLocalStickerSet = yield ctx.api.getStickerSet(name);
        ctx.api.sendSticker(ctx.chat.id, userLocalStickerSet.stickers[0].file_id);
    }
}));
bot.on('message:document', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _p, _q;
    console.log(1);
    if (ctx.session.newStickerSetName == 'waiting_for_add_sticker_to_set') {
        const fileId = ctx.message.document.file_id;
        yield ctx.api.addStickerToSet(ctx.from.id, (_p = ctx.session.selectedStickerPack) !== null && _p !== void 0 ? _p : '', {
            sticker: fileId,
            emoji_list: ['🙂'],
        });
        // Отправляем стикер пользователю
        yield ctx.reply('Стикер добавлен');
    }
    else if (ctx.session.newStickerSetName) {
        // Получаем файловый ID видео
        console.log(2);
        const fileId = ctx.message.document.file_id;
        try {
            const sticker = {
                sticker: fileId,
                emoji_list: ['🙂'],
                is_video: true,
            };
            const name = `${getRandomString()}_by_${bot.botInfo.username}`;
            yield ctx.api.createNewStickerSet(ctx.from.id, name, `${ctx.session.newStickerSetName}_ @ссылканаканал`, [sticker], 'video');
            (_q = ctx.session.stickerPacks) === null || _q === void 0 ? void 0 : _q.push({
                name: name,
                title: ctx.session.newStickerSetName,
            });
            // Отправляем стикер пользователю
            const userLocalStickerSet = yield ctx.api.getStickerSet(name);
            ctx.api.sendSticker(ctx.chat.id, userLocalStickerSet.stickers[0].file_id);
            yield ctx.reply('Стикер добавлен');
        }
        catch (error) {
            yield ctx.reply(`Такой формат файла не поддерживается. Пожалуйста, сконвертируйте изображение в .WEBM. Подробные инструкции собраны в этом документе (https://core.telegram.org/stickers#video-sticker-requirements). `);
        }
    }
}));
bot.callbackQuery('edit', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _r, _s;
    if (yield checkSubscription(ctx)) {
        if ((_r = ctx.session.stickerPacks) === null || _r === void 0 ? void 0 : _r.length) {
            const keyboard = new grammy_1.InlineKeyboard();
            (_s = ctx.session.stickerPacks) === null || _s === void 0 ? void 0 : _s.forEach((elem, index) => {
                keyboard.text(elem.title, `myPack-${elem.name}`).row();
            });
            ctx.reply('Выбери стикер  пак для редактирования:', {
                reply_markup: keyboard,
            });
            yield ctx.answerCallbackQuery();
        }
        else {
            ctx.reply('У тебя нет стикерпаков!');
        }
    }
    else {
        ctx.reply('Пожалуйста, подпишитесь на наши каналы, чтобы начать использовать бота.');
    }
}));
bot.callbackQuery('copy', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield checkSubscription(ctx)) {
        ctx.session.newStickerSetName = 'waiting_for_name_sticker';
        ctx.reply('Введите название для нового стикерпака.');
        yield ctx.answerCallbackQuery();
    }
    else {
        ctx.reply('Пожалуйста, подпишитесь на наши каналы, чтобы начать использовать бота.');
    }
}));
bot.callbackQuery(/^myPack-/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const nameOfStickerPack = ctx.callbackQuery.data.split('-')[1];
    console.log(nameOfStickerPack);
    console.log(nameOfStickerPack);
    console.log(nameOfStickerPack);
    console.log(nameOfStickerPack);
    const keyboard = new grammy_1.InlineKeyboard()
        .url('Посмотреть набор', `t.me/addstickers/${nameOfStickerPack}`)
        .row()
        .text('Изменить название', 'changeName')
        .row()
        .text('Добавить', 'addSticker')
        .text('Удалить', 'delSticker')
        .row()
        .text('Удалить набор', 'delStickerSet')
        .row()
        .text('Вернуться в меню', 'menu')
        .row();
    ctx.reply('Выбери действие', {
        reply_markup: keyboard,
    });
    ctx.session.selectedStickerPack = nameOfStickerPack;
    yield ctx.answerCallbackQuery();
}));
bot.callbackQuery('delStickerSet', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _t, _u;
    try {
        yield ctx.api.deleteStickerSet((_t = ctx.session.selectedStickerPack) !== null && _t !== void 0 ? _t : '');
        ctx.session.stickerPacks = (_u = ctx.session.stickerPacks) === null || _u === void 0 ? void 0 : _u.filter((el) => {
            if (el.name != ctx.session.selectedStickerPack) {
                return el;
            }
        });
        yield ctx.reply(`Стикерпак удален`);
        yield ctx.answerCallbackQuery();
    }
    catch (error) {
        yield ctx.reply(`${error}`);
    }
}));
bot.callbackQuery('changeName', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.newStickerSetName = 'waiting_for_name_change';
    yield ctx.reply('Введите новое название для вaшего стикерпака');
    yield ctx.answerCallbackQuery();
}));
bot.callbackQuery('addSticker', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.newStickerSetName = 'waiting_for_add_sticker_to_set';
    yield ctx.reply('Отправьте фото/видео/стикер для добавления в набор');
    yield ctx.answerCallbackQuery();
}));
bot.callbackQuery('delSticker', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.newStickerSetName = 'waiting_for_del_sticker_from_set';
    yield ctx.reply('Отправте стикер, который вы хотите удалить');
    yield ctx.answerCallbackQuery();
}));
bot.callbackQuery('menu', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const keyboard = new grammy_1.InlineKeyboard()
        .text('Создать стикерпак самостоятельно 🌆', 'create')
        .row()
        .text('Редактировать мои стикерпаки 🌅', 'edit')
        .row()
        .text('Скопировать существующий стикерпак 🌉', 'copy');
    yield ctx.reply('Выберите действие:', { reply_markup: keyboard });
}));
bot.start();
