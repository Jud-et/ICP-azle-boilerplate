import { v4 as uuidv4 } from 'uuid';
import { ic } from 'azle'; 

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

// Helper functions
function getUserById(userId: string): UserProfile | undefined {
  return userProfiles.find(user => user.userId === userId);
}

function getToolById(toolId: string): ToolListing | undefined {
  return toolListings.find(tool => tool.toolId === toolId);
}

function validateInput(input: string, fieldName: string): string | undefined {
  if (!input) return `${fieldName} is required.`;
  if (input.length > 255) return `${fieldName} is too long.`;
  return undefined;
}

/**
 * Adds a new user profile to the system with input validation.
 */
export function addUser(username: string, contactInfo: string): { success: boolean; data?: string; error?: string } {
  const usernameError = validateInput(username, "Username");
  const contactInfoError = validateInput(contactInfo, "Contact Info");
  if (usernameError || contactInfoError) {
    return { success: false, error: `${usernameError ?? ""} ${contactInfoError ?? ""}`.trim() };
  }

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
    return { success: true, data: userId, message: 'User added successfully' };
  } catch (error) {
    return { success: false, error: `Failed to add user: ${(error as Error).message}` };
  }
}

/**
 * Adds a new tool to the tool listings with input validation.
 */
export function addTool(ownerId: string, toolName: string, description: string, condition: string): { success: boolean; data?: string; error?: string } {
  const toolNameError = validateInput(toolName, "Tool Name");
  const descriptionError = validateInput(description, "Description");
  const conditionError = validateInput(condition, "Condition");
  if (toolNameError || descriptionError || conditionError) {
    return { success: false, error: `${toolNameError ?? ""} ${descriptionError ?? ""} ${conditionError ?? ""}`.trim() };
  }

  try {
    const owner = getUserById(ownerId);
    if (!owner) {
      return { success: false, error: 'Owner not found' };
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
    toolListings.push(newTool);
    owner.toolsOwned.push(toolId);

    return { success: true, data: toolId, message: 'Tool added successfully' };
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
 * Allows a user to borrow a tool, with additional validation and availability check.
 */
export function borrowTool(borrowerId: string, toolId: string): { success: boolean; data?: string; error?: string } {
  const borrower = getUserById(borrowerId);
  if (!borrower) {
    return { success: false, error: 'Borrower not found' };
  }

  const tool = getToolById(toolId);
  if (!tool) {
    return { success: false, error: 'Tool not found' };
  }
  if (!tool.availability) {
    return { success: false, error: 'Tool is not available for borrowing' };
  }

  try {
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
    borrower.toolsBorrowed.push(toolId);

    return { success: true, data: transactionId, message: 'Borrow request created successfully' };
  } catch (error) {
    return { success: false, error: `Failed to borrow tool: ${(error as Error).message}` };
  }
}

/**
 * Allows a user to return a borrowed tool, with validation to check transaction status.
 */
export function returnTool(transactionId: string): { success: boolean; data?: string; error?: string } {
  const transaction = borrowingTransactions.find(t => t.transactionId === transactionId);
  if (!transaction || transaction.status !== 'pending') {
    return { success: false, error: 'Invalid transaction or tool has already been returned' };
  }

  try {
    const tool = getToolById(transaction.toolId);
    if (!tool) {
      return { success: false, error: 'Tool not found' };
    }

    transaction.returnDate = new Date().toISOString();
    transaction.status = 'returned';
    tool.availability = true;

    return { success: true, data: `Tool with ID ${transaction.toolId} has been returned`, message: 'Tool returned successfully' };
  } catch (error) {
    return { success: false, error: `Failed to return tool: ${(error as Error).message}` };
  }
}
