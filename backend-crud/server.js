
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";

import User from "./user.js"; // your user model
import dotenv from "dotenv";
dotenv.config();
import Note from "./notes.js";

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    jwt.verify(token, "shanmukh_secret", (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

// Create a new note
app.post('/notes', authenticateToken, async (req, res) => {
    const { title, content } = req.body;
    try {
        const note = new Note({
            title,
            content,
            user: req.user.id
        });
        await note.save();
        res.status(201).json(note);
    } catch (err) {
        res.status(500).json({ message: 'Error creating note' });
    }
});

// Get all notes for the logged-in user
app.get('/notes', authenticateToken, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching notes' });
    }
});

// Update a note
app.put('/notes/:id', authenticateToken, async (req, res) => {
    const { title, content } = req.body;
    try {
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { title, content },
            { new: true }
        );
        if (!note) return res.status(404).json({ message: 'Note not found' });
        res.json(note);
    } catch (err) {
        res.status(500).json({ message: 'Error updating note' });
    }
});

// Delete a note
app.delete('/notes/:id', authenticateToken, async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!note) return res.status(404).json({ message: 'Note not found' });
        res.json({ message: 'Note deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting note' });
    }
});

// ...existing code...

// MongoDB connection
mongoose.connect(process.env.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("MongoDB connection error:", err));

// Signup
app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const exist = await User.findOne({ email });
        if (exist) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        res.json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, "shanmukh_secret", { expiresIn: "1h" });
        res.json({ message: "Login successful", token, username: user.username });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));