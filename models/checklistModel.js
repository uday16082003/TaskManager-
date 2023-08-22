const mongoose = require("mongoose");

const checklistSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  totalCompleted: {
    type: Number,
    default: 0,
  },
  totalTask: {
    type: Number,
    default: 0,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  content: [
    {
      title: {
        type: String,
      },
      isCompleted: {
        type: Boolean,
        default: false,
      },
      addMembers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      startDate: {
        type: Date,
      },
      reminded: {
        type: Boolean,
        default: false,
      },
      dueDate: {
        type: Date,
      },
      lastEditedBy: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          time: {
            type: Date,
          },
          comment: {
            type: String,
          },
        },
      ],
    },
  ],
  lastEditedBy: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      time: {
        type: Date,
      },
      comment: {
        type: String,
      },
    },
  ],
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Card",
  },
});

module.exports = mongoose.model("Checklist", checklistSchema);
