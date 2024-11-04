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

/**
 * Adds a new user profile to the system.
 * @param username - The name of the user.
 * @param contactInfo - Contact information for the user.
 * @returns The ID of the newly added user.
 */
export function addUser(username: string, contactInfo: string): string {
    const userId = uuidv4(); // Generate a unique ID for the user.
    
    const newUser: UserProfile = {
      userId,
      username,
      contactInfo,
      toolsOwned: [],
      toolsBorrowed: []
    };
  
    userProfiles.push(newUser); // Add the user to the in-memory storage.
    return userId; // Return the unique ID of the new user.
  }

/**
 * Adds a new tool to the tool listings.
 * @param ownerId - The ID of the user who owns the tool.
 * @param toolName - The name of the tool.
 * @param description - A description of the tool.
 * @param condition - The condition of the tool (e.g., "new", "good", "worn").
 * @returns The ID of the newly added tool.
 */
export function addTool(ownerId: string, toolName: string, description: string, condition: string): string {
    const toolId = uuidv4(); // Generate a unique ID for the tool.
    
    const newTool: ToolListing = {
      toolId,
      ownerId,
      toolName,
      description,
      availability: true,
      condition
    };
  
    toolListings.push(newTool); // Add the tool to the tool listings.
  
    // Update the owner's list of tools
    const owner = userProfiles.find(user => user.userId === ownerId);
    if (owner) {
      owner.toolsOwned.push(toolId);
    }
  
    return toolId; // Return the unique ID of the new tool.
  }
/**
 * Retrieves all available tools for borrowing.
 * @returns An array of tools that are currently available for borrowing.
 */
export function viewAvailableTools(): ToolListing[] {
    // Filter and return tools that are available.
    return toolListings.filter(tool => tool.availability);
  }
/**
 * Allows a user to borrow a tool.
 * @param borrowerId - The ID of the user borrowing the tool.
 * @param toolId - The ID of the tool to be borrowed.
 * @returns A CanisterResult containing the transaction ID if successful.
 */
export function borrowTool(borrowerId: string, toolId: string): CanisterResult<string> {
    const tool = toolListings.find(t => t.toolId === toolId);
    if (!tool || !tool.availability) {
      return ic.reject('Tool is not available for borrowing');
    }
  
    const transactionId = uuidv4(); // Generate a unique transaction ID.
    
    const newTransaction: BorrowingTransaction = {
      transactionId,
      toolId,
      borrowerId,
      borrowDate: new Date().toISOString(),
      returnDate: null,
      status: 'pending'
    };
  
    borrowingTransactions.push(newTransaction); // Add the transaction to the storage.
    tool.availability = false; // Mark the tool as unavailable.
  
    // Update borrower's tools list
    const borrower = userProfiles.find(user => user.userId === borrowerId);
    if (borrower) {
      borrower.toolsBorrowed.push(toolId);
    }
  
    return ic.ok(transactionId); // Return the unique ID of the transaction.
  }
  
  /**
   * Allows a user to return a borrowed tool.
   * @param transactionId - The ID of the transaction.
   * @returns A CanisterResult indicating the outcome of the return.
   */
  export function returnTool(transactionId: string): CanisterResult<string> {
    const transaction = borrowingTransactions.find(t => t.transactionId === transactionId);
    if (!transaction || transaction.status !== 'pending') {
      return ic.reject('Invalid transaction or tool has already been returned');
    }
  
    transaction.returnDate = new Date().toISOString(); // Set the return date.
    transaction.status = 'returned'; // Update the transaction status.
  
    // Update tool availability
    const tool = toolListings.find(t => t.toolId === transaction.toolId);
    if (tool) {
      tool.availability = true; // Mark the tool as available.
    }
  
    return ic.ok(`Tool with ID ${transaction.toolId} has been returned`); // Confirm the return.
  }
     
