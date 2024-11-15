# Tool Lending Library Canister 🛠️📚

A decentralized community tool-sharing platform built on the Internet Computer Protocol (ICP). This project enables secure, transparent, and efficient tool lending between community members using blockchain technology.

## 🌟 Features

### User Management
- Create and manage user profiles with unique IDs
- Store contact information and track owned/borrowed tools
- Update user information and manage account status
- Secure user deletion with active transaction checks

### Tool Management
- Add tools to the library with detailed descriptions
- Track tool availability and condition
- Update tool information and status
- Remove tools with safeguards for active loans

### Transaction System
- Create borrowing transactions with automated status tracking
- Monitor tool lending history
- Process tool returns with status updates
- Manage transaction lifecycle from pending to returned

### Utility Functions
- View all available tools in the library
- Track tool lending history
- Process returns with automated availability updates
- Handle transaction state management

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- Internet Computer SDK (DFX)
- Node Version Manager (NVM)

### Development Environment Setup

1. **Install Node Version Manager (NVM)**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc  # Or restart your terminal
nvm install 20
nvm use 20
```

2. **Install DFX**

For macOS:
```bash
brew install podman
DFX_VERSION=0.16.1 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
echo 'export PATH="$PATH:$HOME/bin"' >> "$HOME/.bashrc"
```

For Ubuntu/WSL2:
```bash
sudo apt-get update
sudo apt-get install podman
DFX_VERSION=0.16.1 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```

### Project Setup

1. **Clone the Repository**
```bash
git clone https://github.com/Jud-et/ICP-azle-boilerplate.git
cd ICP-azle-boilerplate
```

2. **Install Dependencies**
```bash
npm install
```

3. **Deploy the Canister**
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📖 API Reference

### User Operations

```typescript
createUser(username: string, contactInfo: string): Response<string>
readUser(userId: string): Response<UserProfile>
updateUser(userId: string, updates: Partial<UserProfile>): Response<UserProfile>
deleteUser(userId: string): Response<void>
```

### Tool Operations

```typescript
createTool(ownerId: string, toolName: string, description: string, condition: string): Response<string>
readTool(toolId: string): Response<ToolListing>
updateTool(toolId: string, updates: Partial<ToolListing>): Response<ToolListing>
deleteTool(toolId: string): Response<void>
```

### Transaction Operations

```typescript
createTransaction(borrowerId: string, toolId: string): Response<string>
readTransaction(transactionId: string): Response<BorrowingTransaction>
updateTransaction(transactionId: string, updates: Partial<BorrowingTransaction>): Response<BorrowingTransaction>
deleteTransaction(transactionId: string): Response<void>
```

### Utility Functions

```typescript
viewAvailableTools(): Response<ToolListing[]>
returnTool(transactionId: string): Response<string>
```

## 🏗️ Data Models

### UserProfile
```typescript
{
  userId: string;
  username: string;
  contactInfo: string;
  toolsOwned: string[];
  toolsBorrowed: string[];
}
```

### ToolListing
```typescript
{
  toolId: string;
  ownerId: string;
  toolName: string;
  description: string;
  availability: boolean;
  condition: string;
}
```

### BorrowingTransaction
```typescript
{
  transactionId: string;
  toolId: string;
  borrowerId: string;
  borrowDate: string;
  returnDate: string | null;
  status: 'pending' | 'approved' | 'returned';
}
```

## 🤝 Contributing

We welcome contributions from the open-source community to improve the Tool Lending Library project! To contribute:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request for review.
Please ensure your code is well-documented and follows best practices. Together, we can make this project even more impactful for communities everywhere! 🌍

Feel free to reach out if you have any questions or suggestions for improvement! 😊
