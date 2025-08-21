import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  authorSid: { type: String, required: true },
  content: { type: String, default: "" },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
  memeUrl: { type: String, default: null },
  reactions: { type: Map, of: Number, default: {} },
}, { timestamps: true });

export default mongoose.model("Comment", CommentSchema);