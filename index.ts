import axios from 'axios';
import { Bot, Context, InlineKeyboard, InputFile, Keyboard, session, SessionFlavor } from 'grammy';
import sharp from 'sharp';
interface ShortStickerInfo {
  title: string;
  name: string;
}
interface MySession {
  newStickerSetName?: string;
  stickerPacks?: ShortStickerInfo[];
  type: string;
  selectedStickerPack: string | null;
}
type MyContext = Context & SessionFlavor<MySession>;
function initial(): MySession {
  return { newStickerSetName: '', stickerPacks: [], type: '', selectedStickerPack: null };
}
const bot = new Bot<MyContext>('xxx'); // <-- поместите токен вашего бота в эту строку
bot.use(session({ initial }));
// Функция для проверки подписки на каналы
async function checkSubscription(ctx: Context) {
  // Замените 'channelusername' на имя вашего канала
  const member = await ctx.api.getChatMember('@STR_memes', ctx.from?.id ?? 1);
  return (
    member.status === 'member' || member.status === 'creator' || member.status === 'administrator'
  );
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
bot.command('start', async (ctx) => {
  if (await checkSubscription(ctx)) {
    // Если пользователь подписан на канал, показываем ему клавиатуру
    const keyboard = new InlineKeyboard()
      .text('Создать стикерпак самостоятельно 🌆', 'create')
      .row()
      .text('Редактировать мои стикерпаки 🌅', 'edit')
      .row()
      .text('Скопировать существующий стикерпак 🌉', 'copy');
    await ctx.reply('Выберите действие:', { reply_markup: keyboard });
  } else {
    // Если пользователь не подписан на канал, просим его подписаться\\
    const keyboard = new InlineKeyboard()
      .url('Подписаться на канал 1 ✅', 'https://t.me/STR_memes')
      .url('Подписаться на канал 2 ✅', 'https://t.me/STR_memes');
    await ctx.reply('Пожалуйста, подпишитесь на эти каналы, чтобы начать использовать бота:', {
      reply_markup: keyboard,
    });
  }
});

// Обработка нажатий на кнопки
bot.callbackQuery('create', async (ctx) => {
  if (await checkSubscription(ctx)) {
    const keyboard = new Keyboard()
      .text('🖼 Обычные')
      .text('🎥 Видео')
      .row()
      .text('➡️Вернуться в меню')
      .resized();
    ctx.reply('Выберете тип стикерпака.', {
      reply_markup: keyboard,
    });
    await ctx.answerCallbackQuery();
  } else {
    ctx.reply('Пожалуйста, подпишитесь на наши каналы, чтобы начать использовать бота.');
  }
});

bot.hears('➡️Вернуться в меню', async (ctx) => {
  if (await checkSubscription(ctx)) {
    // Если пользователь подписан на канал, показываем ему клавиатуру
    const keyboard = new InlineKeyboard()
      .text('Создать стикерпак самостоятельно 🌆', 'create')
      .row()
      .text('Редактировать мои стикерпаки 🌅', 'edit')
      .row()
      .text('Скопировать существующий стикерпак 🌉', 'copy');
    await ctx.reply('Выберите действие:', { reply_markup: keyboard });
  } else {
    // Если пользователь не подписан на канал, просим его подписаться\\
    const keyboard = new InlineKeyboard()
      .url('Подписаться на канал 1 ✅', 'https://t.me/STR_memes')
      .url('Подписаться на канал 2 ✅', 'https://t.me/STR_memes');
    await ctx.reply('Пожалуйста, подпишитесь на эти каналы, чтобы начать использовать бота:', {
      reply_markup: keyboard,
    });
  }
});
bot.hears('🖼 Обычные', async (ctx) => {
  if (await checkSubscription(ctx)) {
    ctx.reply('🖼️ Отправь название для нового набора');
    ctx.session.newStickerSetName = 'waiting_for_name';
    ctx.session.type = 'photo';
  } else {
    ctx.reply('Пожалуйста, подпишитесь на наши каналы, чтобы начать использовать бота.');
  }
});
bot.hears('🎥 Видео', async (ctx) => {
  if (await checkSubscription(ctx)) {
    ctx.reply('🎥 Отправь название для нового набора');
    ctx.session.newStickerSetName = 'waiting_for_name_video';
    ctx.session.type = 'video';
  } else {
    ctx.reply('Пожалуйста, подпишитесь на наши каналы, чтобы начать использовать бота.');
  }
});

bot.on('message:text', async (ctx) => {
  if (ctx.session.newStickerSetName === 'waiting_for_name') {
    const stickerName = ctx.message.text; // Создание стикерпака -> выбор названия
    ctx.session.newStickerSetName = stickerName; // Запись названия в сессию
    console.log(ctx.session.stickerPacks);

    await ctx.reply('Теперь отправьте фотографию для стикерпака.');
  } else if (ctx.session.newStickerSetName === 'waiting_for_name_video') {
    const stickerName = ctx.message.text;
    ctx.session.newStickerSetName = stickerName;
    console.log(ctx.session.stickerPacks);

    await ctx.reply('Теперь отправьте видео для добавления в стикерпак');
  } else if (ctx.session.newStickerSetName === 'waiting_for_name_sticker') {
    const stickerName = ctx.message.text; // Создание стикерпака(со стикеров) -> выбор названия
    ctx.session.newStickerSetName = stickerName; // Запись названия в сессию
    console.log(ctx.session.stickerPacks);

    await ctx.reply('Теперь отправьте стикер из стикерпака, который вы ходите скопировать.');
  } else if ((ctx.session.newStickerSetName = 'waiting_for_name_change')) {
    const stickerName = ctx.message.text;
    ctx.session.newStickerSetName = stickerName;
    try {
      console.log(ctx.session.selectedStickerPack);
      console.log(ctx.message.text);
      await ctx.api.setStickerSetTitle(
        ctx.session.selectedStickerPack ?? 'MyPack',
        `${ctx.message.text}_ @ссылканаканал`,
      );
      ctx.session.stickerPacks = ctx.session.stickerPacks?.map((el) => {
        if (el.name == ctx.session.selectedStickerPack) {
          return { title: ctx.message.text, name: el.name };
        } else {
          return el;
        }
      });
      await ctx.reply(`Название стикерпака изменено на ${ctx.message.text}_ @ссылканаканал`);
      console.log(ctx.session.stickerPacks);
    } catch (error) {
      await ctx.reply(`${error}`);
    }
  }
});
interface ISticker {
  sticker: string;
  emoji_list: string[];
  is_video?: boolean;
}

bot.on('message:sticker', async (ctx) => {
  try {
    if (ctx.session.newStickerSetName == 'waiting_for_del_sticker_from_set') {
      const stickerId = ctx.message.sticker.file_id;
      try {
        await ctx.api.deleteStickerFromSet(stickerId);
        await ctx.reply('Стикер удалён');
        ctx.session.newStickerSetName = 'waiting_for_name';
      } catch (error) {
        await ctx.reply('Стикер, который вы хотите удалить, не содержиться в наборе');
      } // удаление стикера из набора
    } else if (ctx.session.newStickerSetName == 'waiting_for_add_sticker_to_set') {
      const stickerSet = await ctx.api.getStickerSet(ctx.session.selectedStickerPack ?? '');
      const stickerId = ctx.message.sticker.file_id;
      console.log(stickerSet);
      console.log(ctx.message.sticker);
      const stickerType = ctx.message.sticker.is_video;
      if (!stickerType && !stickerSet.is_video) {
        const stickerId = ctx.message.sticker.file_id;
        await ctx.api.addStickerToSet(ctx.from.id, ctx.session.selectedStickerPack ?? '', {
          sticker: stickerId,
          emoji_list: ['🙂'],
        });
        await ctx.reply('Стикер добавлен ');
        ctx.session.newStickerSetName = 'waiting_for_name';
      } else if (stickerType && stickerSet.is_video) {
        const stickerId = ctx.message.sticker.file_id;
        await ctx.api.addStickerToSet(ctx.from.id, ctx.session.selectedStickerPack ?? '', {
          sticker: stickerId,
          emoji_list: ['🙂'],
        });
        await ctx.reply('Стикер добавлен ');
        ctx.session.newStickerSetName = 'waiting_for_name';
      } else {
        await ctx.reply('Тип стикера не сответствует типу стикерпака');
      }
    } else if (
      ctx.session.newStickerSetName &&
      ctx.session.newStickerSetName != 'waiting_for_name'
    ) {
      const sticker = ctx.message.sticker.set_name;

      const stickerSet = await ctx.api.getStickerSet(`${sticker}`);
      const length = stickerSet.stickers.length;
      if (length > 50) {
        await ctx.reply('Слишком много стикеров в стикерпаке!');
        return;
      }
      let stickerSetForNewPack: ISticker[] = [];

      for (let i = 0; i < length; i++) {
        // Загрузите файл стикера, если это видео-стикер
        if (stickerSet.stickers[i].is_video) {
          await ctx.reply('Видео стикеры - не поддерживаются');
        } else {
          stickerSetForNewPack.push({
            sticker: stickerSet.stickers[i].file_id,
            emoji_list: [stickerSet.stickers[i].emoji ?? ''],
            is_video: stickerSet.is_video,
          });
        }
      }
      console.log(stickerSet);
      console.log(stickerSetForNewPack);
      const name = `${getRandomString()}_by_${bot.botInfo.username}`;
      console.log(name);

      await ctx.api.createNewStickerSet(
        ctx.from.id,
        name,
        `${ctx.session.newStickerSetName}_ @ссылканаканал`,
        stickerSetForNewPack,
        stickerSet.is_video ? 'video' : stickerSet.is_animated ? 'animated' : 'static',
      );

      const userLocalStickerSet = await ctx.api.getStickerSet(name);
      ctx.api.sendSticker(ctx.chat.id, userLocalStickerSet.stickers[0].file_id);
      ctx.session.stickerPacks?.push({ title: ctx.session.newStickerSetName, name: name });
      console.log(ctx.session.stickerPacks);
      ctx.session.newStickerSetName = 'waiting_for_name';
    } else {
      await ctx.reply('Вы не ввели название для нового стикерпака');
    }
  } catch (error) {
    await ctx.reply(`${error}`);
  }
});

bot.on('message:photo', async (ctx) => {
  if (ctx.session.newStickerSetName == 'waiting_for_add_sticker_to_set') {
    // Получаем файловый ID фотографии
    const fileId = ctx.message?.photo[ctx.message?.photo.length - 1].file_id;
    try {
      // Получаем информацию о файле
      const file = await ctx.api.getFile(fileId ?? '');

      // Составляем URL для файла
      const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

      // Скачиваем фотографию
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });

      // Изменяем размер фотографии до 512x512 с помощью sharp
      const resizedPhoto = await sharp(response.data)
        .resize(512, 512, { fit: 'contain', position: 'center' })
        .toBuffer();
      const stickerFile = new InputFile(resizedPhoto, 'sticker.png');
      await ctx.api.addStickerToSet(ctx.from.id, ctx.session.selectedStickerPack ?? '', {
        sticker: stickerFile,
        emoji_list: ['🙂'],
      });
      // Отправляем стикер пользователю
      await ctx.reply('Стикер добавлен');
    } catch (error) {
      console.error(error);
    }
  } else if (ctx.session.newStickerSetName) {
    const fileId = ctx.message?.photo[ctx.message?.photo.length - 1].file_id;
    // Составляем URL для файла
    const file = await ctx.api.getFile(fileId ?? '');
    const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

    // Скачиваем фотографию
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });

    // Изменяем размер фотографии до 512x512 с помощью sharp
    const resizedPhoto = await sharp(response.data).resize(512, 512).toBuffer();
    const stickerFile = new InputFile(resizedPhoto, 'sticker.png');
    const sticker = {
      sticker: stickerFile,
      emoji_list: ['🙂'],
    };
    const name = `${getRandomString()}_by_${bot.botInfo.username}`;
    await ctx.api.createNewStickerSet(
      ctx.from.id,
      name,
      `${ctx.session.newStickerSetName}_ @ссылканаканал`,
      [sticker],
      'static',
    );
    ctx.session.stickerPacks?.push({
      name: name,
      title: ctx.session.newStickerSetName,
    });
    const userLocalStickerSet = await ctx.api.getStickerSet(name);
    ctx.api.sendSticker(ctx.chat.id, userLocalStickerSet.stickers[0].file_id);
  }
});
bot.on('message:document', async (ctx) => {
  console.log(1);
  if (ctx.session.newStickerSetName == 'waiting_for_add_sticker_to_set') {
    const fileId = ctx.message.document.file_id;
    await ctx.api.addStickerToSet(ctx.from.id, ctx.session.selectedStickerPack ?? '', {
      sticker: fileId,
      emoji_list: ['🙂'],
    });
    // Отправляем стикер пользователю
    await ctx.reply('Стикер добавлен');
  } else if (ctx.session.newStickerSetName) {
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
      await ctx.api.createNewStickerSet(
        ctx.from.id,
        name,
        `${ctx.session.newStickerSetName}_ @ссылканаканал`,
        [sticker],
        'video',
      );
      ctx.session.stickerPacks?.push({
        name: name,
        title: ctx.session.newStickerSetName,
      });
      // Отправляем стикер пользователю
      const userLocalStickerSet = await ctx.api.getStickerSet(name);
      ctx.api.sendSticker(ctx.chat.id, userLocalStickerSet.stickers[0].file_id);
      await ctx.reply('Стикер добавлен');
    } catch (error) {
      await ctx.reply(
        `Такой формат файла не поддерживается. Пожалуйста, сконвертируйте изображение в .WEBM. Подробные инструкции собраны в этом документе (https://core.telegram.org/stickers#video-sticker-requirements). `,
      );
    }
  }
});
bot.callbackQuery('edit', async (ctx) => {
  if (await checkSubscription(ctx)) {
    if (ctx.session.stickerPacks?.length) {
      const keyboard = new InlineKeyboard();
      ctx.session.stickerPacks?.forEach((elem, index) => {
        keyboard.text(elem.title, `myPack-${elem.name}`).row();
      });
      ctx.reply('Выбери стикер  пак для редактирования:', {
        reply_markup: keyboard,
      });
      await ctx.answerCallbackQuery();
    } else {
      ctx.reply('У тебя нет стикерпаков!');
    }
  } else {
    ctx.reply('Пожалуйста, подпишитесь на наши каналы, чтобы начать использовать бота.');
  }
});

bot.callbackQuery('copy', async (ctx) => {
  if (await checkSubscription(ctx)) {
    ctx.session.newStickerSetName = 'waiting_for_name_sticker';
    ctx.reply('Введите название для нового стикерпака.');
    await ctx.answerCallbackQuery();
  } else {
    ctx.reply('Пожалуйста, подпишитесь на наши каналы, чтобы начать использовать бота.');
  }
});

bot.callbackQuery(/^myPack-/, async (ctx) => {
  const nameOfStickerPack = ctx.callbackQuery.data.split('-')[1];
  console.log(nameOfStickerPack);
  console.log(nameOfStickerPack);
  console.log(nameOfStickerPack);
  console.log(nameOfStickerPack);
  const keyboard = new InlineKeyboard()
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
  await ctx.answerCallbackQuery();
});
bot.callbackQuery('delStickerSet', async (ctx) => {
  try {
    await ctx.api.deleteStickerSet(ctx.session.selectedStickerPack ?? '');
    ctx.session.stickerPacks = ctx.session.stickerPacks?.filter((el) => {
      if (el.name != ctx.session.selectedStickerPack) {
        return el;
      }
    });
    await ctx.reply(`Стикерпак удален`);
    await ctx.answerCallbackQuery();
  } catch (error) {
    await ctx.reply(`${error}`);
  }
});
bot.callbackQuery('changeName', async (ctx) => {
  ctx.session.newStickerSetName = 'waiting_for_name_change';
  await ctx.reply('Введите новое название для вaшего стикерпака');

  await ctx.answerCallbackQuery();
});

bot.callbackQuery('addSticker', async (ctx) => {
  ctx.session.newStickerSetName = 'waiting_for_add_sticker_to_set';
  await ctx.reply('Отправьте фото/видео/стикер для добавления в набор');

  await ctx.answerCallbackQuery();
});

bot.callbackQuery('delSticker', async (ctx) => {
  ctx.session.newStickerSetName = 'waiting_for_del_sticker_from_set';
  await ctx.reply('Отправте стикер, который вы хотите удалить');
  await ctx.answerCallbackQuery();
});
bot.callbackQuery('menu', async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text('Создать стикерпак самостоятельно 🌆', 'create')
    .row()
    .text('Редактировать мои стикерпаки 🌅', 'edit')
    .row()
    .text('Скопировать существующий стикерпак 🌉', 'copy');
  await ctx.reply('Выберите действие:', { reply_markup: keyboard });
});
bot.start();
