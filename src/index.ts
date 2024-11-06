import { v4 as uuidv4 } from 'uuid';
import { ic } from 'azle'; // Adjusted to only use what Azle provides

// Type definitions
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

// Storage arrays
let userProfiles: UserProfile[] = [];
let toolListings: ToolListing[] = [];
let borrowingTransactions: BorrowingTransaction[] = [];

/**
 * Adds a new user profile to the system.
 */
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
    userProfiles.push(newUser);
    return { success: true, data: userId };
  } catch (error) {
    return { success: false, error: `Failed to add user: ${(error as Error).message}` };
  }
}

/**
 * Adds a new tool to the tool listings.
 */
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
    toolListings.push(newTool);

    const owner = userProfiles.find(user => user.userId === ownerId);
    if (owner) {
      owner.toolsOwned.push(toolId);
    } else {
      throw new Error('Owner not found');
    }

    return { success: true, data: toolId };
  } catch (error) {
    return { success: false, error: `Failed to add tool: ${(error as Error).message}` };
  }
}

/**
 * Retrieves all available tools for borrowing.
 */
export function viewAvailableTools(): { success: boolean; data?: ToolListing[]; error?: string } {
  try {
    const availableTools = toolListings.filter(tool => tool.availability);
    return { success: true, data: availableTools };
  } catch (error) {
    return { success: false, error: `Failed to retrieve tools: ${(error as Error).message}` };
  }
}

/**
 * Allows a user to borrow a tool.
 */
export function borrowTool(borrowerId: string, toolId: string): { success: boolean; data?: string; error?: string } {
  try {
    const tool = toolListings.find(t => t.toolId === toolId);
    if (!tool || !tool.availability) {
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

    borrowingTransactions.push(newTransaction);
    tool.availability = false;

    const borrower = userProfiles.find(user => user.userId === borrowerId);
    if (borrower) {
      borrower.toolsBorrowed.push(toolId);
    } else {
      throw new Error('Borrower not found');
    }

    return { success: true, data: transactionId };
  } catch (error) {
    return { success: false, error: `Failed to borrow tool: ${(error as Error).message}` };
  }
}

/**
 * Allows a user to return a borrowed tool.
 */
export function returnTool(transactionId: string): { success: boolean; data?: string; error?: string } {
  try {
    const transaction = borrowingTransactions.find(t => t.transactionId === transactionId);
    if (!transaction || transaction.status !== 'pending') {
      throw new Error('Invalid transaction or tool has already been returned');
    }

    transaction.returnDate = new Date().toISOString();
    transaction.status = 'returned';

    const tool = toolListings.find(t => t.toolId === transaction.toolId);
    if (tool) {
      tool.availability = true;
    } else {
      throw new Error('Tool not found');
    }

    return { success: true, data: `Tool with ID ${transaction.toolId} has been returned` };
  } catch (error) {
    return { success: false, error: `Failed to return tool: ${(error as Error).message}` };
  }
}
