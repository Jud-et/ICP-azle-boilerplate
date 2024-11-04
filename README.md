# Tool Lending Library Canister 🛠️📚

Welcome to the **Tool Lending Library** project! This project is a decentralized solution for community members to lend and borrow tools from each other, making resources more accessible and fostering a spirit of collaboration and sustainability. Built on the Internet Computer Protocol (ICP), this project leverages blockchain technology to create a secure, transparent, and user-friendly tool-sharing platform.

## Project Description 📖

The **Tool Lending Library** is a canister built with TypeScript (Azle) on the Internet Computer. It allows community members to:

- Register their profiles and join the lending library.
- Add tools to the library for others to borrow.
- Borrow tools from the library.
- Keep track of borrowing transactions, including return status.

The aim of this project is to empower communities by sharing resources, reducing costs, and promoting sustainability.

## Main Features ✨

- **User Registration**: Members can create profiles to join the library and participate in lending and borrowing.
- **Tool Listings**: Users can add their tools, along with details such as availability and condition, to the library for others to borrow.
- **Borrow Tools**: Borrowing tools is simple, with transactions recorded and tracked for transparency.
- **Return Tools**: Users can return borrowed tools, updating their availability in the library.

## How to Run the Project 🚀

Follow these steps to set up the environment and run the **Tool Lending Library** canister on your local machine.

### Prerequisites 📋

Before getting started, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **DFX** (Internet Computer SDK)
- **NVM** (Node Version Manager)

### Step 1: Set Up the Environment ⚙️

1. **Install Node Version Manager (nvm)**:

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
   ```

   After installation, close and reopen your terminal, then run:

   ```bash
   nvm install 20
   nvm use 20
   ```

2. **Install DFX**:
   
   **DFX** is the command-line interface for the Internet Computer. It provides tools for creating, deploying, and managing canisters.
   
   - **Installing DFX on macOS**:
     - Install **Homebrew** (if not already installed):
       ```bash
       /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
       ```
     - Update command line tools:
       ```bash
       xcode-select --install
       ```
     - Install **Podman**:
       ```bash
       brew install podman
       ```
     - Install **DFX**:
       ```bash
       DFX_VERSION=0.16.1 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
       ```
     - Add **DFX** to your PATH:
       ```bash
       echo 'export PATH="$PATH:$HOME/bin"' >> "$HOME/.bashrc"
       ```
     - Verify the installation:
       ```bash
       dfx --version
       ```
   
   - **Installing DFX on Ubuntu and WSL2**:
     - Install necessary dependencies:
       ```bash
       sudo apt-get install podman
       ```

### Step 2: Clone the Repository 🧩

Clone the **Tool Lending Library** repository to your local machine:

```bash
git clone https://github.com/Jud-et/ICP-azle-boilerplate.git
```

Navigate to the project directory:

```bash
cd ICP-azle-boilerplate
```

### Step 3: Install Dependencies 📦

Install the project dependencies:

```bash
npm install
```

### Step 4: Deploy the Canister 🔨

To deploy the canister, make sure the local Internet Computer is running and execute the provided `deploy.sh` script:

1. **Make the deploy script executable**:

   ```bash
   chmod +x deploy.sh
   ```

2. **Run the deployment**:

   ```bash
   ./deploy.sh
   ```

This script will start the Internet Computer locally, install the required dependencies, and deploy the Tool Lending Library canister.

### Step 5: Interact with the Canister 📞

Once deployed, you can interact with the canister using DFX commands to test its functionality, such as adding tools, borrowing, and returning them.

### Contribution Guidelines 🤝

We welcome contributions from the open-source community to improve the **Tool Lending Library** project! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request for review.

Please ensure your code is well-documented and follows best practices. Together, we can make this project even more impactful for communities everywhere! 🌍

## License 📜

This project is open source and available under the [MIT License](LICENSE).

Feel free to reach out if you have any questions or suggestions for improvement! 😊

