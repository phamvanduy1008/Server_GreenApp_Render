import mongoose from "mongoose";
import { Schema, model } from "mongoose";

// Admin Schema
const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, default: "" },
    role: { type: String, enum: ["superadmin", "admin"], default: "admin" },
  },
  { timestamps: true }
);

// User Schema
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile: {
      full_name: { type: String, default: "" },
      username: { type: String, default: "" },
      gender: {
        type: String,
        enum: ["male", "female", "other", ""],
        default: "",
      },
      birthday: { type: Date, default: null },
      phone: { type: String, default: "" },
      avatar: { type: String, default: "" },
    },
    addresses: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, 
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        ward: { type: String },
        district: { type: String },
        city: { type: String },
      },
    ],
    onboarding_completed : {type : Number, default: 0},
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Category Schema
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

// Plant Schema
const plantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    avgPriceYesterday: { type: Number, default: 0 },
    avgPriceNow: { type: Number, default: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

// InforPlant Schema
const inforPlantSchema = new mongoose.Schema(
  {
    climate: { type: String, required: true },
    land: { type: String, required: true },
    target: { type: String, default: "" },
    time: { type: String, default: "" },
    water: { type: String, required: true },
    fertilize: { type: String, default: "" },
    grass: { type: String, default: "" },
    insect: { type: String, default: "" },
    disease: { type: String, default: "" },
    harvest: { type: String, default: "" },
    preserve: { type: String, default: "" },
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
      required: true,
    },
  },
  { timestamps: true }
);

// Product Schema
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    info: { type: String, default: "" },
    image: { type: String, default: "" },
    status: {
      type: String,
      enum: ["available", "out_of_stock"],
      default: "available",
    },
    evaluate: { type: Number, default: 5 },
    sold: { type: Number, default: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

// UserCart Schema
const userCartSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Seller Schema (Order Schema)
const sellerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],

  status: {
    type: String,
    enum: ["pending", "resolved", "processing", "delivered", "cancelled"],
    default: "pending",
  },
  orderCode: { type: String, required: true, unique: true },
  momoId :{type: String},
  full_name: { type: String },
  phone: { type: String },
  address: { type: String },
  paymentMethod: { type: String },
  fee: { type: Number },
  total_price: { type: Number },
  dateOrder: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const favouriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

const noticeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    isRead: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ["pending", "resolved", "processing", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const MessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sender: {
    type: String,
    required: true,
    validate: {
      validator: (value) => /^(user|admin):[0-9a-fA-F]{24}$/.test(value),
      message:
        'Sender phải có định dạng "user:<id>" hoặc "admin:<id>" với ID hợp lệ',
    },
  },
  receiver: {
    type: String,
    required: true,
    validate: {
      validator: (value) => /^(user|admin):[0-9a-fA-F]{24}$/.test(value),
      message:
        'Receiver phải có định dạng "user:<id>" hoặc "admin:<id>" với ID hợp lệ',
    },
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
const shipperAccSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    full_name: { type: String, default: "" },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    assignedOrders: [
      {
        sellers: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
        status: {
          type: String,
          enum: ["processing", "delivered", "cancelled"],
          default: "processing",
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  characteristic: {
    type: String,
    default: "Nâu đậm",
  },
  fit: {
    type: String,
    default: "Đúng chuẩn",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Review = mongoose.model("Review", reviewSchema);
export const Favourite = mongoose.model("Favourite", favouriteSchema);
export const Admin = mongoose.model("Admin", adminSchema);
export const User = mongoose.model("User", userSchema);
export const Category = mongoose.model("Category", categorySchema);
export const Plant = mongoose.model("Plant", plantSchema);
export const Infor = mongoose.model("Infors", inforPlantSchema);
export const Product = mongoose.model("Product", productSchema);
export const UserCart = mongoose.model("UserCart", userCartSchema);
export const Seller = mongoose.model("Seller", sellerSchema);
export const Notice = mongoose.model("Notice", noticeSchema);
export const Message = model("Message", MessageSchema);
export const Shipper = mongoose.model("Shipper", shipperAccSchema);
