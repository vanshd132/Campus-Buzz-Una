import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  type: { type: String, enum: ["event", "lostfound", "announcement"], required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  authorSid: { type: String, required: true },

  // Event fields
  eventDate: { type: Date },
  location: { type: String },
  rsvp: {
    going: { type: Number, default: 0 },
    interested: { type: Number, default: 0 },
    notGoing: { type: Number, default: 0 },
  },

  // Lost & Found fields
  lostFoundType: { type: String, enum: ["lost", "found"], default: undefined },
  item: { type: String },
  lfLocation: { type: String },
  imageUrl: { type: String },

  // Announcement fields
  department: { type: String },
  attachmentUrl: { type: String },
  attachmentType: { type: String, enum: ["image", "pdf"], default: undefined },

  // Reactions (simple counters per emoji)
  reactions: { type: Map, of: Number, default: {} },
}, { timestamps: true });

export default mongoose.model("Post", PostSchema);