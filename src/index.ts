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
    
