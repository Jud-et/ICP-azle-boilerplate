import { v4 as uuidv4 } from 'uuid';
import { Server, StableBTreeMap, ic } from 'azle';
import express from 'express';
import { Principal } from '@dfinity/principal';

/**
 * Represents a user's profile.
 */

type UserProfile = {
  userId: string;
  username: string;
  contactInfo: string;
  toolsOwned: string[];
  toolsBorrowed: string[];
};

/**
 * Represents a tool listing for lending.
 */
type ToolListing = {
  toolId: string;
  ownerId: string;
  toolName: string;
  description: string;
  availability: boolean;
  condition: string;
};

/**
 * Represents a borrowing transaction for tools.
 */
type BorrowingTransaction = {
  transactionId: string;
  toolId: string;
  borrowerId: string;
  borrowDate: string;
  returnDate: string | null;
  status: 'pending' | 'approved' | 'returned';
};

// Storage for user profiles, tools, and transactions
let userProfiles: UserProfile[] = [];
let toolListings: ToolListing[] = [];
let borrowingTransactions: BorrowingTransaction[] = [];
