const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        personalEmail: {
            type: String,
            lowercase: true,
            trim: true,
            default: ""
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        role: {
            type: String,
            enum: ["ADMIN", "USER"],
            default: "USER"
        },

        department: {
            type: String,
            trim: true,
            default: ""
        },

        designation: {
            type: String,
            trim: true,
            default: ""
        },

        hireDate: {
            type: Date,
            default: null
        },

        isActive: {
            type: Boolean,
            default: true
        },

        lastLogin: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Employee", employeeSchema);