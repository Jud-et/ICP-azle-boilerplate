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

// User CRUD Operations
export function createUser(username: string, contactInfo: string): { success: boolean; data?: string; error?: string } {
  try {
    if (!username || !contactInfo) {
      throw new Error('Username and contact info are required');
    }
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
    return { success: false, error: `Failed to create user: ${(error as Error).message}` };
  }
}

export function readUser(userId: string): { success: boolean; data?: UserProfile; error?: string } {
  try {
    const user = userProfilesStorage.get(userId);
    if ("None" in user) {
      throw new Error('User not found');
    }
    return { success: true, data: user.Some };
  } catch (error) {
    return { success: false, error: `Failed to read user: ${(error as Error).message}` };
  }
}

export function updateUser(userId: string, updates: Partial<UserProfile>): { success: boolean; data?: UserProfile; error?: string } {
  try {
    const existingUser = userProfilesStorage.get(userId);
    if ("None" in existingUser) {
      throw new Error('User not found');
    }
    const updatedUser = {
      ...existingUser.Some,
      ...updates,
      userId: existingUser.Some.userId // Prevent userId from being modified
    };
    userProfilesStorage.insert(userId, updatedUser);
    return { success: true, data: updatedUser };
  } catch (error) {
    return { success: false, error: `Failed to update user: ${(error as Error).message}` };
  }
}

export function deleteUser(userId: string): { success: boolean; error?: string } {
  try {
    const user = userProfilesStorage.get(userId);
    if ("None" in user) {
      throw new Error('User not found');
    }
    // Check for active borrowing transactions
    const transactions = borrowingTransactionsStorage.values();
    const activeTransactions = transactions.filter(t => 
      (t.borrowerId === userId || user.Some.toolsOwned.includes(t.toolId)) && 
      t.status !== 'returned'
    );
    if (activeTransactions.length > 0) {
      throw new Error('Cannot delete user with active borrowing transactions');
    }
    userProfilesStorage.remove(userId);
    return { success: true };
  } catch (error) {
    return { success: false, error: `Failed to delete user: ${(error as Error).message}` };
  }
}

// Tool CRUD Operations
export function createTool(ownerId: string, toolName: string, description: string, condition: string): { success: boolean; data?: string; error?: string } {
  try {
    if (!toolName || !description || !condition) {
      throw new Error('Tool name, description, and condition are required');
    }
    const owner = userProfilesStorage.get(ownerId);
    if ("None" in owner) {
      throw new Error('Owner not found');
    }
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
    owner.Some.toolsOwned.push(toolId);
    userProfilesStorage.insert(ownerId, owner.Some);
    return { success: true, data: toolId };
  } catch (error) {
    return { success: false, error: `Failed to create tool: ${(error as Error).message}` };
  }
}

export function readTool(toolId: string): { success: boolean; data?: ToolListing; error?: string } {
  try {
    const tool = toolListingsStorage.get(toolId);
    if ("None" in tool) {
      throw new Error('Tool not found');
    }
    return { success: true, data: tool.Some };
  } catch (error) {
    return { success: false, error: `Failed to read tool: ${(error as Error).message}` };
  }
}

export function updateTool(toolId: string, updates: Partial<ToolListing>): { success: boolean; data?: ToolListing; error?: string } {
  try {
    const existingTool = toolListingsStorage.get(toolId);
    if ("None" in existingTool) {
      throw new Error('Tool not found');
    }
    const updatedTool = {
      ...existingTool.Some,
      ...updates,
      toolId: existingTool.Some.toolId, // Prevent toolId from being modified
      ownerId: existingTool.Some.ownerId // Prevent ownerId from being modified
    };
    toolListingsStorage.insert(toolId, updatedTool);
    return { success: true, data: updatedTool };
  } catch (error) {
    return { success: false, error: `Failed to update tool: ${(error as Error).message}` };
  }
}

export function deleteTool(toolId: string): { success: boolean; error?: string } {
  try {
    const tool = toolListingsStorage.get(toolId);
    if ("None" in tool) {
      throw new Error('Tool not found');
    }
    // Check for active borrowing transactions
    const transactions = borrowingTransactionsStorage.values();
    const activeTransactions = transactions.filter(t => 
      t.toolId === toolId && t.status !== 'returned'
    );
    if (activeTransactions.length > 0) {
      throw new Error('Cannot delete tool with active borrowing transactions');
    }
    // Remove tool from owner's toolsOwned array
    const owner = userProfilesStorage.get(tool.Some.ownerId);
    if ("Some" in owner) {
      owner.Some.toolsOwned = owner.Some.toolsOwned.filter(t => t !== toolId);
      userProfilesStorage.insert(tool.Some.ownerId, owner.Some);
    }
    toolListingsStorage.remove(toolId);
    return { success: true };
  } catch (error) {
    return { success: false, error: `Failed to delete tool: ${(error as Error).message}` };
  }
}

// Transaction CRUD Operations
export function createTransaction(borrowerId: string, toolId: string): { success: boolean; data?: string; error?: string } {
  try {
    const tool = toolListingsStorage.get(toolId);
    if ("None" in tool || !tool.Some.availability) {
      throw new Error('Tool is not available for borrowing');
    }
    const borrower = userProfilesStorage.get(borrowerId);
    if ("None" in borrower) {
      throw new Error('Borrower not found');
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
    borrower.Some.toolsBorrowed.push(toolId);
    userProfilesStorage.insert(borrowerId, borrower.Some);
    return { success: true, data: transactionId };
  } catch (error) {
    return { success: false, error: `Failed to create transaction: ${(error as Error).message}` };
  }
}

export function readTransaction(transactionId: string): { success: boolean; data?: BorrowingTransaction; error?: string } {
  try {
    const transaction = borrowingTransactionsStorage.get(transactionId);
    if ("None" in transaction) {
      throw new Error('Transaction not found');
    }
    return { success: true, data: transaction.Some };
  } catch (error) {
    return { success: false, error: `Failed to read transaction: ${(error as Error).message}` };
  }
}

export function updateTransaction(transactionId: string, updates: Partial<BorrowingTransaction>): { success: boolean; data?: BorrowingTransaction; error?: string } {
  try {
    const existingTransaction = borrowingTransactionsStorage.get(transactionId);
    if ("None" in existingTransaction) {
      throw new Error('Transaction not found');
    }
    const updatedTransaction = {
      ...existingTransaction.Some,
      ...updates,
      transactionId: existingTransaction.Some.transactionId // Prevent transactionId from being modified
    };
    borrowingTransactionsStorage.insert(transactionId, updatedTransaction);
    return { success: true, data: updatedTransaction };
  } catch (error) {
    return { success: false, error: `Failed to update transaction: ${(error as Error).message}` };
  }
}

export function deleteTransaction(transactionId: string): { success: boolean; error?: string } {
  try {
    const transaction = borrowingTransactionsStorage.get(transactionId);
    if ("None" in transaction) {
      throw new Error('Transaction not found');
    }
    if (transaction.Some.status !== 'returned') {
      throw new Error('Cannot delete active transaction');
    }
    borrowingTransactionsStorage.remove(transactionId);
    return { success: true };
  } catch (error) {
    return { success: false, error: `Failed to delete transaction: ${(error as Error).message}` };
  }
}

// Utility Functions
export function viewAvailableTools(): { success: boolean; data?: ToolListing[]; error?: string } {
  try {
    const allTools = toolListingsStorage.values();
    const availableTools = allTools.filter(tool => tool.availability);
    return { success: true, data: availableTools };
  } catch (error) {
    return { success: false, error: `Failed to retrieve tools: ${(error as Error).message}` };
  }
}

export function returnTool(transactionId: string): { success: boolean; data?: string; error?: string } {
  try {
    const transaction = borrowingTransactionsStorage.get(transactionId);
    if ("None" in transaction || transaction.Some.status !== 'pending') {
      throw new Error('Invalid transaction or tool has already been returned');
    }
    const updatedTransaction = {
      ...transaction.Some,
      returnDate: new Date().toISOString(),
      status: 'returned' as const
    };
    borrowingTransactionsStorage.insert(transactionId, updatedTransaction);

    const tool = toolListingsStorage.get(transaction.Some.toolId);
    if ("Some" in tool) {
      tool.Some.availability = true;
      toolListingsStorage.insert(transaction.Some.toolId, tool.Some);
      
      // Update borrower's toolsBorrowed array
      const borrower = userProfilesStorage.get(transaction.Some.borrowerId);
      if ("Some" in borrower) {
        borrower.Some.toolsBorrowed = borrower.Some.toolsBorrowed.filter(t => t !== transaction.Some.toolId);
        userProfilesStorage.insert(transaction.Some.borrowerId, borrower.Some);
      }
    } else {
      throw new Error('Tool not found');
    }
    return { success: true, data: `Tool with ID ${transaction.Some.toolId} has been returned` };
  } catch (error) {
    return { success: false, error: `Failed to return tool: ${(error as Error).message}` };
  }
}