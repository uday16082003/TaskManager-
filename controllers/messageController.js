const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const Message = require("../models/messageModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const cloudinary = require("cloudinary");

exports.sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { content, chatId } = req.body;
  if (!content) {
    return;
  }
  if (!chatId) {
    return next(new ErrorHandler("Required parameters not Provided", 400));
  }

  var newMessage = {
    sender: req.user._id,
    content: {
      message: content,
      type: "Message",
    },
    chat: chatId,
    isReadBy: [req.user._id],
  };

  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "username avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username avatar email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.status(200).json(message);
  } catch (error) {
    return next(new ErrorHandler("Invalid Chat Id", 400));
  }
});

exports.sendAudioMessage = catchAsyncErrors(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.file.path, {
    folder: "Chat_app_audio",
    resource_type: "video",
  });
  const { chatId } = req.body;
  if (!chatId) {
    return next(new ErrorHandler("Required parameters not Provided", 400));
  }

  var newAudioMessage = {
    sender: req.user._id,
    audio: { public_id: myCloud.public_id, url: myCloud.secure_url },
    chat: chatId,
  };
  try {
    var message = await Message.create(newAudioMessage);
    message = await message.populate("sender", "username avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username avatar email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.status(200).json(message);
  } catch (error) {
    return next(new ErrorHandler("Invalid Chat Id", 400));
  }
});
exports.sendVideoMessage = catchAsyncErrors(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.file.path, {
    folder: "Chat_app_video",
    resource_type: "video",
  });
  const { chatId } = req.body;
  if (!chatId) {
    return next(new ErrorHandler("Required parameters not Provided", 400));
  }

  var newVideoMessage = {
    sender: req.user._id,
    video: { public_id: myCloud.public_id, url: myCloud.secure_url },
    chat: chatId,
  };
  try {
    var message = await Message.create(newVideoMessage);
    message = await message.populate("sender", "username avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username avatar email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.status(200).json(message);
  } catch (error) {
    return next(new ErrorHandler("Invalid Chat Id", 400));
  }
});

exports.sendImageMessage = catchAsyncErrors(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.file.path, {
    folder: "Chat_app_images",
  });
  const { chatId } = req.body;
  if (!chatId) {
    return next(new ErrorHandler("Required parameters not Provided", 400));
  }

  var newMessage = {
    sender: req.user._id,
    image: { public_id: myCloud.public_id, url: myCloud.secure_url },
    chat: chatId,
  };
  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "username avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username avatar email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.status(200).json(message);
  } catch (error) {
    return next(new ErrorHandler("Invalid Chat Id", 400));
  }
});

exports.sendDocumentMessage = catchAsyncErrors(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.file.path, {
    resource_type: "auto",
    folder: "Chat_app_document",
  });
  const { chatId } = req.body;

  if (!chatId) {
    return next(new ErrorHandler("Required parameters not Provided", 400));
  }

  var newMessage = {
    sender: req.user._id,
    document: { public_id: myCloud.public_id, url: myCloud.url },
    chat: chatId,
  };
  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "username avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username avatar email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.status(200).json(message);
  } catch (error) {
    return next(new ErrorHandler("Invalid Chat Id", 400));
  }
});

exports.allMessages = catchAsyncErrors(async (req, res, next) => {
  try {
    const { chatId } = req.params;

    if (!chatId) {
      return next(new ErrorHandler("Required parameters not Provided", 400));
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "username avatar email")
      .populate("chat");

    const chat = await Chat.findById(chatId)
      .populate("users")
      .populate("groupAdmin", "username avatar")
      .populate("workspace", "title");

    res.status(200).json({ messages, chat });
  } catch (error) {
    return next(new ErrorHandler("Invalid request", 400));
  }
});

exports.isReadMessage = catchAsyncErrors(async (req, res, next) => {
  const { messageId } = req.params;

  if (!messageId)
    return next(new ErrorHandler("Required parameters not Provided", 400));

  const message = await Message.findById(messageId);

  if (!message) return next(new ErrorHandler("Message not found", 404));

  const ifExist = message.isReadBy.find(
    (user) => user._id.toString() === req.user._id.toString()
  );

  if (ifExist) {
    return next(new ErrorHandler("User already Read this message", 400));
  }

  message.isReadBy.push(req.user._id);
  await message.save();

  res.status(200).json({ success: true, message });
});
exports.deleteMessageFromSelf = catchAsyncErrors(async (req, res, next) => {
  const { chatId, messageId } = req.params;

  if (!chatId || !messageId) {
    return next(new ErrorHandler("Required parameters not Provided", 400));
  }
  const message = await Message.findOne({
    chat: chatId,
    _id: messageId,
  })
    .populate("sender", "username avatar email")
    .populate("chat");

  if (!message) {
    return next(new ErrorHandler("Message not found", 404));
  }

  const isDeletedBy = req.user._id.toString();
  const existingId = message.isDeletedBy.find(
    (userId) => userId.toString() === isDeletedBy
  );

  if (existingId) {
    return next(new ErrorHandler("Already deleted by you", 400));
  }

  message.isDeleted = true;
  message.isDeletedBy.push(isDeletedBy);
  await message.save();

  res.status(200).json({ success: true });
});

exports.deleteMessageFromEverybody = catchAsyncErrors(
  async (req, res, next) => {
    const { chatId, messageId } = req.params;

    if (!chatId || !messageId) {
      return next(new ErrorHandler("Required parameters not Provided", 400));
    }

    const message = await Message.findOne({
      chat: chatId,
      _id: messageId,
    })
      .populate("sender", "username avatar email")
      .populate("chat");

    if (!message) {
      return next(new ErrorHandler("Message not found", 404));
    }

    const isDeletedBy = req.user._id.toString();
    const existingId = message.isDeletedBy.find(
      (userId) => userId.toString() === isDeletedBy
    );

    if (existingId) {
      return next(new ErrorHandler("Already deleted by you", 400));
    }

    if (message.sender._id.toString() === req.user._id.toString()) {
      await message.remove();
      return res.status(200).json({ success: true });
    }

    return next(new ErrorHandler("Unauthorized", 401));
  }
);
