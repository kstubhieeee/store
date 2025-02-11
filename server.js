import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const port = 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

app.use(cors());
app.use(express.json());
app.use("/images", express.static("public/images/store"));

const uploadDir = "public/images/store";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/store/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload an image."), false);
    }
  },
});

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

let db;

async function createAdminCollection() {
  try {
    await db.createCollection("admins");
    console.log("Admins collection created");
  } catch (error) {
    if (error.code !== 48) {
      console.error("Error creating admins collection:", error);
    }
  }
}

async function connectToDb() {
  try {
    await client.connect();
    db = client.db("store");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Could not connect to MongoDB:", error);
  }
}

connectToDb().then(() => {
  createAdminCollection();
});

app.post("/api/admin/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingAdmin = await db.collection("admins").findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      createdAt: new Date(),
    };

    const result = await db.collection("admins").insertOne(admin);

    const token = jwt.sign(
      { userId: result.insertedId, email, firstName, lastName, isAdmin: true },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    delete admin.password;

    res.status(201).json({
      token,
      user: {
        id: result.insertedId,
        ...admin,
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error("Admin signup error:", error);
    res.status(500).json({ message: "Error creating admin account" });
  }
});

app.post("/api/admin/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await db.collection("admins").findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        isAdmin: true,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    delete admin.password;

    res.json({
      token,
      user: {
        ...admin,
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error("Admin signin error:", error);
    res.status(500).json({ message: "Error signing in" });
  }
});

app.post("/api/signup", async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      alternatePhone,
      dateOfBirth,
      gender,
      company,
      address,
      city,
      state,
      zipCode,
      country,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZipCode,
      shippingCountry,
      useShippingForBilling,
    } = req.body;

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      alternatePhone,
      dateOfBirth,
      gender,
      company,
      address,
      city,
      state,
      zipCode,
      country,
      shippingAddress: useShippingForBilling ? address : shippingAddress,
      shippingCity: useShippingForBilling ? city : shippingCity,
      shippingState: useShippingForBilling ? state : shippingState,
      shippingZipCode: useShippingForBilling ? zipCode : shippingZipCode,
      shippingCountry: useShippingForBilling ? country : shippingCountry,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(user);

    const token = jwt.sign(
      { userId: result.insertedId, email, firstName, lastName },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    delete user.password;

    res.status(201).json({
      token,
      user: {
        id: result.insertedId,
        ...user,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

app.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    delete user.password;

    res.json({
      token,
      user,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Error signing in" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await db.collection("products").find({}).toArray();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    const { name, price, discount, description, quantity } = req.body;
    const imagePath = req.file ? `/images/${req.file.filename}` : null;

    const product = {
      name,
      price: Number(price),
      discount: Number(discount),
      description,
      quantity: Number(quantity),
      imagePath,
    };

    const result = await db.collection("products").insertOne(product);
    const newProduct = { ...product, _id: result.insertedId };
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Error adding product" });
  }
});

app.put("/api/products/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (req.file) {
      updates.imagePath = `/images/${req.file.filename}`;

      const oldProduct = await db
        .collection("products")
        .findOne({ _id: new ObjectId(id) });
      if (oldProduct?.imagePath) {
        const oldImagePath = path.join("public", oldProduct.imagePath);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    if (updates.price) updates.price = Number(updates.price);
    if (updates.discount) updates.discount = Number(updates.discount);
    if (updates.quantity) updates.quantity = Number(updates.quantity);

    const result = await db
      .collection("products")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updates },
        { returnDocument: "after" }
      );

    if (!result) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(id) });
    if (product?.imagePath) {
      const imagePath = path.join("public", product.imagePath);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    const result = await db.collection("products").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully", id });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
