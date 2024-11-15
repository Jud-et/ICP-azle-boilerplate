import { v4 as uuidv4 } from 'uuid';
import { Server, StableBTreeMap, ic } from 'azle';
import express from 'express';

// Data Models
type UserProfile = {
  userId: string;
  username: string;
  contactInfo: string;
  toolsOwned: string[];
  toolsBorrowed: string[];
};

type ToolListing = {
  toolId: string;
  ownerId: string;
  toolName: string;
  description: string;
  availability: boolean;
  condition: string;
};

type BorrowingTransaction = {
  transactionId: string;
  toolId: string;
  borrowerId: string;
  borrowDate: string;
  returnDate: string | null;
  status: 'pending' | 'approved' | 'returned';
};

// Storage
const userProfilesStorage = StableBTreeMap<string, UserProfile>(0);
const toolListingsStorage = StableBTreeMap<string, ToolListing>(1);
const borrowingTransactionsStorage = StableBTreeMap<string, BorrowingTransaction>(2);

// Functions
export function addUser(username: string, contactInfo: string): { success: boolean; data?: string; error?: string } {
  try {
    const userId = uuidv4();
    const newUser: UserProfile = {
      userId,
      username,
      contactInfo,
      toolsOwned: [],
      toolsBorrowed: []
    };
    userProfilesStorage.insert(userId, newUser);
    return { success: true, data: userId };
  } catch (error) {
    return { success: false, error: `Failed to add user: ${(error as Error).message}` };
  }
}

export function addTool(ownerId: string, toolName: string, description: string, condition: string): { success: boolean; data?: string; error?: string } {
  try {
    const toolId = uuidv4();
    const newTool: ToolListing = {
      toolId,
      ownerId,
      toolName,
      description,
      availability: true,
      condition
    };
    toolListingsStorage.insert(toolId, newTool);

    const owner = userProfilesStorage.get(ownerId);
    if ("Some" in owner) {
      owner.Some.toolsOwned.push(toolId);
      userProfilesStorage.insert(ownerId, owner.Some);
    } else {
      throw new Error('Owner not found');
    }

    return { success: true, data: toolId };
  } catch (error) {
    return { success: false, error: `Failed to add tool: ${(error as Error).message}` };
  }
}

export function viewAvailableTools(): { success: boolean; data?: ToolListing[]; error?: string } {
  try {
    const allTools = toolListingsStorage.values();
    const availableTools = allTools.filter(tool => tool.availability);
    return { success: true, data: availableTools };
  } catch (error) {
    return { success: false, error: `Failed to retrieve tools: ${(error as Error).message}` };
  }
}

export function borrowTool(borrowerId: string, toolId: string): { success: boolean; data?: string; error?: string } {
  try {
    const tool = toolListingsStorage.get(toolId);
    if ("None" in tool || !tool.Some.availability) {
      throw new Error('Tool is not available for borrowing');
    }

    const transactionId = uuidv4();
    const newTransaction: BorrowingTransaction = {
      transactionId,
      toolId,
      borrowerId,
      borrowDate: new Date().toISOString(),
      returnDate: null,
      status: 'pending'
    };

    borrowingTransactionsStorage.insert(transactionId, newTransaction);
    tool.Some.availability = false;
    toolListingsStorage.insert(toolId, tool.Some);

    const borrower = userProfilesStorage.get(borrowerId);
    if ("Some" in borrower) {
      borrower.Some.toolsBorrowed.push(toolId);
      userProfilesStorage.insert(borrowerId, borrower.Some);
    } else {
      throw new Error('Borrower not found');
    }

    return { success: true, data: transactionId };
  } catch (error) {
    return { success: false, error: `Failed to borrow tool: ${(error as Error).message}` };
  }
}

export function returnTool(transactionId: string): { success: boolean; data?: string; error?: string } {
  try {
    const transaction = borrowingTransactionsStorage.get(transactionId);
    if ("None" in transaction || transaction.Some.status !== 'pending') {
      throw new Error('Invalid transaction or tool has already been returned');
    }

    transaction.Some.returnDate = new Date().toISOString();
    transaction.Some.status = 'returned';
    borrowingTransactionsStorage.insert(transactionId, transaction.Some);

    const tool = toolListingsStorage.get(transaction.Some.toolId);
    if ("Some" in tool) {
      tool.Some.availability = true;
      toolListingsStorage.insert(transaction.Some.toolId, tool.Some);
    } else {
      throw new Error('Tool not found');
    }

    return { success: true, data: `Tool with ID ${transaction.Some.toolId} has been returned` };
  } catch (error) {
    return { success: false, error: `Failed to return tool: ${(error as Error).message}` };
  }
}