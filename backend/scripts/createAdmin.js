require("dotenv").config();

const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const Employee = require("../models/Employee");


const createAdmin = async () => {

    try {

        await connectDB();


        const email =
            "admin@darkmail.com";

        const password =
            "Admin@123";


        const existingAdmin =
            await Employee.findOne({
                email
            });


        if (existingAdmin) {

            console.log(
                "Admin already exists:"
            );

            console.log(
                existingAdmin.email
            );

            process.exit(0);
        }


        const hashedPassword =
            await bcrypt.hash(password, 12);


        const admin =
            await Employee.create({

                employeeId: "ADM001",

                name: "DarkMail Administrator",

                email,

                personalEmail: "",

                password: hashedPassword,

                role: "ADMIN",

                department: "Administration",

                designation: "System Administrator",

                hireDate: new Date(),

                isActive: true
            });


        console.log("");
        console.log(
            "================================"
        );
        console.log(
            "   DARKMAIL ADMIN CREATED"
        );
        console.log(
            "================================"
        );

        console.log(
            `Employee ID : ${admin.employeeId}`
        );

        console.log(
            `Email       : ${admin.email}`
        );

        console.log(
            `Password    : ${password}`
        );

        console.log(
            "Role        : ADMIN"
        );

        console.log(
            "================================"
        );


        process.exit(0);

    } catch (error) {

        console.error(
            "Admin creation failed:",
            error
        );

        process.exit(1);
    }
};


createAdmin();