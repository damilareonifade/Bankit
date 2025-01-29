import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../@types/express";
import User from "../models/User";
import mongoose from "mongoose";
import Transaction from "../models/Transaction";


import dotenv from 'dotenv';
dotenv.config();


const initializePayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const session = await mongoose.startSession(); // Start a DB session
    session.startTransaction(); // Begin transaction

    try {
        const { userId, amount, accountNumber, bankCode } = req.body;

        // ✅ Input validation
        if (!userId || !amount || amount <= 0 || !accountNumber || !bankCode) {
            throw new Error("Invalid input. Please provide userId, valid amount, accountNumber, and bankCode.");
        }

        // Fetch user (inside transaction)
        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new Error("User not found.");
        }

        // Generate unique transaction reference
        const reference = uuidv4();

        // ✅ Prevent duplicate transactions
        const existingTransaction = await Transaction.findOne({ reference, status: "pending" }).session(session);
        if (existingTransaction) {
            throw new Error("Duplicate transaction detected.");
        }

        // Create a new transaction record (Pending) inside transaction
        const transaction = new Transaction({
            userId: user._id,
            amount,
            reference,
            status: "pending",
            type: "transfer",
            recipient: accountNumber,
        });
        await transaction.save({ session });

        // ✅ Call Paystack API for fund transfer
        const paystackResponse = await axios.post(
            "https://api.paystack.co/transfer",
            {
                source: "balance",
                amount,
                reference,
                recipient: {
                    type: "nuban",
                    name: `${user.first_name} ${user.last_name}`,
                    account_number: accountNumber,
                    bank_code: bankCode,
                    currency: "NGN",
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // Extract response data
        const { status, data } = paystackResponse.data;
        if (!status) {
            throw new Error("Funds transfer failed.");
        }

        //  Update transaction status to "successful" inside transaction
        transaction.status = "success";
        await transaction.save({ session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: "Funds transfer successful.",
            transfer_details: data,
            reference,
        });

    } catch (error: any) {
        // Rollback the transaction in case of failure
        await session.abortTransaction();
        session.endSession();

        console.error("Funds Transfer Error:", error.message);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

const verifyPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { reference } = req.body;

        if (!reference) {
            res.status(400).json({ message: "Transaction reference is required." });
            return;
        }


        const paystackResponse = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
            }
        );

        const { status, data } = paystackResponse.data;
        console.log(status, data, 'data for transaction')
        if (!status || data.status !== "success") {
            res.status(400).json({ message: "Transaction verification failed or payment was unsuccessful." });
            return;
        }


        const user = await User.findById(data.metadata.userId);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }


        const existingTransaction = await Transaction.findOne({ reference });
        if (existingTransaction) {
            res.status(400).json({ message: "Duplicate transaction." });
            return;
        }


        user.balance += data.amount / 100
        await user.save();

        const transaction = new Transaction({
            userId: user._id,
            amount: data.amount / 100,
            reference,
            status: "success",
        });

        await transaction.save();

        res.status(200).json({ message: "Payment verified and balance updated.", balance: user.balance });
    } catch (error) {
        next(error);
    }
};


export { initializePayment, verifyPayment };
