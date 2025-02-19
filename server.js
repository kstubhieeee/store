import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";

dotenv.config();

const app = express();
const port = 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

app.use(cors());
app.use(express.json());
app.use("/images", express.static("public/images/store"));

// Create the upload directory if it doesn't exist
const uploadDir = "public/images/store";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image upload
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
    fileSize: 5 * 1024 * 1024, // 5MB limit
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

// Create admin collection if it doesn't exist
async function createAdminCollection() {
  try {
    await db.createCollection("admins");
    console.log("Admins collection created");
  } catch (error) {
    if (error.code !== 48) {
      // 48 is the error code for "collection already exists"
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

// Add the reCAPTCHA verification function
async function verifyRecaptcha(token) {
  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: "6LfhjNMqAAAAAKlSRaIuGXcuw2nZ2MHOUoqWwzXr",
          response: token,
        },
      }
    );

    return response.data.success && response.data.score >= 0.5;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
}

connectToDb().then(() => {
  createAdminCollection();
});

// Admin Authentication Routes
app.post("/api/admin/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if admin already exists
    const existingAdmin = await db.collection("admins").findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const admin = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      createdAt: new Date(),
    };

    const result = await db.collection("admins").insertOne(admin);

    // Create JWT token
    const token = jwt.sign(
      { userId: result.insertedId, email, firstName, lastName, isAdmin: true },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove password from admin object before sending response
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

    // Find admin
    const admin = await db.collection("admins").findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
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

    // Remove password from admin object before sending response
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

// User Authentication Routes
app.post("/api/signup", async (req, res) => {
  try {
    const { recaptchaToken, ...userData } = req.body;

    // Verify reCAPTCHA
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return res.status(400).json({ message: "reCAPTCHA verification failed" });
    }

    // Rest of the sign-up logic remains the same
    const existingUser = await db
      .collection("users")
      .findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = {
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(user);

    const token = jwt.sign(
      {
        userId: result.insertedId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
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
    const { email, password, recaptchaToken } = req.body;

    // Verify reCAPTCHA
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return res.status(400).json({ message: "reCAPTCHA verification failed" });
    }

    // Find user
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
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

    // Remove password from user object before sending response
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

// Get all products
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
    const {
      name,
      price,
      discount,
      description,
      quantity,
      merchantId,
      merchantName,
    } = req.body;
    const imagePath = req.file ? `/images/${req.file.filename}` : null;

    const product = {
      name,
      price: Number(price),
      discount: Number(discount),
      description,
      quantity: Number(quantity),
      imagePath,
      merchantId,
      merchantName,
      status: "pending", // Set default status to 'pending'
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

      // Delete old image if it exists
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

    // Convert numeric fields
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

app.put("/api/products/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const result = await db
      .collection("products")
      .updateOne({ _id: new ObjectId(id) }, { $set: { status } });

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product status updated successfully" });
  } catch (error) {
    console.error("Error updating product status:", error);
    res.status(500).json({ message: "Error updating product status" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Get the product to delete its image
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

// Add these new cart endpoints after your existing endpoints
app.post("/api/cart", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Check if cart exists for user
    let cart = await db.collection("carts").findOne({ userId });

    if (cart) {
      // Check if product exists in cart
      const existingProduct = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingProduct) {
        // Update quantity if product exists
        await db.collection("carts").updateOne(
          {
            userId,
            "items.productId": new ObjectId(productId),
          },
          {
            $inc: { "items.$.quantity": quantity },
          }
        );
      } else {
        // Add new product to cart
        await db.collection("carts").updateOne(
          { userId },
          {
            $push: {
              items: {
                productId: new ObjectId(productId),
                quantity,
              },
            },
          }
        );
      }
    } else {
      // Create new cart
      await db.collection("carts").insertOne({
        userId,
        items: [
          {
            productId: new ObjectId(productId),
            quantity,
          },
        ],
        createdAt: new Date(),
      });
    }

    res.status(200).json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Error updating cart" });
  }
});

app.get("/api/cart/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await db.collection("carts").findOne({ userId });

    if (!cart) {
      return res.json({ items: [] });
    }

    // Get product details for each item in cart
    const productIds = cart.items.map((item) => new ObjectId(item.productId));
    const products = await db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray();

    // Combine product details with cart quantities
    const cartItems = cart.items.map((cartItem) => {
      const product = products.find(
        (p) => p._id.toString() === cartItem.productId.toString()
      );
      return {
        ...product,
        cartQuantity: cartItem.quantity,
      };
    });

    res.json({ items: cartItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Error fetching cart" });
  }
});

app.delete("/api/cart/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    await db.collection("carts").updateOne(
      { userId },
      {
        $pull: {
          items: { productId: new ObjectId(productId) },
        },
      }
    );

    res.json({ message: "Product removed from cart" });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res.status(500).json({ message: "Error removing product from cart" });
  }
});

app.put("/api/cart/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    await db.collection("carts").updateOne(
      {
        userId,
        "items.productId": new ObjectId(productId),
      },
      {
        $set: { "items.$.quantity": quantity },
      }
    );

    res.json({ message: "Cart quantity updated" });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    res.status(500).json({ message: "Error updating cart quantity" });
  }
});

app.post("/api/merchant/register", async (req, res) => {
  try {
    const {
      businessName,
      email,
      password,
      phone,
      address,
      businessType,
      description,
      panCard,
      aadharCard,
      gstin,
    } = req.body;

    // Check if merchant already exists
    const existingMerchant = await db
      .collection("merchants")
      .findOne({ email });
    if (existingMerchant) {
      return res.status(400).json({ message: "Merchant already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new merchant
    const merchant = {
      businessName,
      email,
      password: hashedPassword,
      phone,
      address,
      businessType,
      description,
      panCard,
      aadharCard,
      gstin,
      createdAt: new Date(),
    };

    const result = await db.collection("merchants").insertOne(merchant);

    // Create JWT token
    const token = jwt.sign(
      { userId: result.insertedId, email, businessName, isMerchant: true },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove password from merchant object before sending response
    delete merchant.password;

    res.status(201).json({
      token,
      user: {
        id: result.insertedId,
        ...merchant,
        isMerchant: true,
      },
    });
  } catch (error) {
    console.error("Merchant registration error:", error);
    res.status(500).json({ message: "Error creating merchant account" });
  }
});

app.post("/api/merchant/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find merchant
    const merchant = await db.collection("merchants").findOne({ email });
    if (!merchant) {
      return res.status(400).json({ message: "Merchant not found" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, merchant.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: merchant._id,
        email: merchant.email,
        businessName: merchant.businessName,
        isMerchant: true,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove password from merchant object before sending response
    delete merchant.password;

    res.json({
      token,
      user: {
        ...merchant,
        isMerchant: true,
      },
    });
  } catch (error) {
    console.error("Merchant login error:", error);
    res.status(500).json({ message: "Error signing in" });
  }
});

// Add these routes after your existing merchant routes

// Get all merchants
app.get("/api/merchant/list", async (req, res) => {
  try {
    const merchants = await db.collection("merchants").find({}).toArray();
    res.json(merchants);
  } catch (error) {
    console.error("Error fetching merchants:", error);
    res.status(500).json({ message: "Error fetching merchants" });
  }
});

app.delete("/api/merchant/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid merchant ID" });
    }

    const result = await db.collection("merchants").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    res.json({ message: "Merchant deleted successfully", id });
  } catch (error) {
    console.error("Error deleting merchant:", error);
    res.status(500).json({ message: "Error deleting merchant" });
  }
});

// Update merchant status
app.put("/api/merchant/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid merchant ID" });
    }

    const result = await db
      .collection("merchants")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status } },
        { returnDocument: "after" }
      );

    if (!result) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating merchant status:", error);
    res.status(500).json({ message: "Error updating merchant status" });
  }
});

// Update merchant details
app.put("/api/merchant/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid merchant ID" });
    }

    const result = await db
      .collection("merchants")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updates },
        { returnDocument: "after" }
      );

    if (!result) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating merchant:", error);
    res.status(500).json({ message: "Error updating merchant" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await db.collection("products").findOne({
      _id: new ObjectId(id),
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Error fetching product" });
  }
});

app.delete("/api/cart/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    await db.collection("carts").deleteOne({ userId });

    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Error clearing cart" });
  }
});

// Create a transaction
app.post("/api/transactions", async (req, res) => {
  try {
    const {
      userId,
      items,
      totalAmount,
      paymentMethod,
      paymentId,
      status = "completed",
    } = req.body;

    const transaction = {
      userId,
      items,
      totalAmount,
      paymentMethod,
      paymentId,
      status,
      date: new Date(),
    };

    const result = await db.collection("transactions").insertOne(transaction);
    res.status(201).json({ ...transaction, _id: result.insertedId });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: "Error creating transaction" });
  }
});

// Get user's transaction history
app.get("/api/transactions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await db
      .collection("transactions")
      .find({ userId })
      .sort({ date: -1 }) // Sort by date descending (newest first)
      .toArray();

    // For each transaction, get the full product details for each item
    const transactionsWithProducts = await Promise.all(
      transactions.map(async (transaction) => {
        const itemsWithDetails = await Promise.all(
          transaction.items.map(async (item) => {
            const product = await db
              .collection("products")
              .findOne({ _id: new ObjectId(item.productId) });
            return {
              ...product,
              quantity: item.quantity,
              _id: item.productId,
            };
          })
        );

        return {
          ...transaction,
          items: itemsWithDetails,
        };
      })
    );

    res.json(transactionsWithProducts);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

// Update transaction status
app.put("/api/transactions/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const result = await db
      .collection("transactions")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status } },
        { returnDocument: "after" }
      );

    if (!result) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating transaction status:", error);
    res.status(500).json({ message: "Error updating transaction status" });
  }
});

// Modify your existing checkout/payment success handlers to create transactions

// Update the successful payment handler in your Razorpay implementation
const handleRazorpaySuccess = async (userId, paymentId, items, totalAmount) => {
  try {
    await db.collection("transactions").insertOne({
      userId,
      items,
      totalAmount,
      paymentMethod: "razorpay",
      paymentId,
      status: "completed",
      date: new Date(),
    });
  } catch (error) {
    console.error("Error creating transaction record:", error);
  }
};

// Update the successful payment handler in your PayPal implementation
const handlePayPalSuccess = async (userId, paymentId, items, totalAmount) => {
  try {
    await db.collection("transactions").insertOne({
      userId,
      items,
      totalAmount,
      paymentMethod: "paypal",
      paymentId,
      status: "completed",
      date: new Date(),
    });
  } catch (error) {
    console.error("Error creating transaction record:", error);
  }
};

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
